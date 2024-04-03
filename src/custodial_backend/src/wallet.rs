
use std::{borrow::{Borrow, BorrowMut}, str::FromStr};

use candid::{CandidType, Nat, Principal};
use ethaddr::Address;
use ethers_core::{k256::{ecdsa::{self, VerifyingKey}, Secp256k1}, types::{NameOrAddress, U256, U64}, utils::keccak256};
use ic_cdk::{api, caller};
use serde::{Deserialize, Serialize};
use ic_interfaces_adapter_client::RpcError;

use crate::rpc::{RpcService};

#[derive(CandidType, Deserialize)]
pub enum InstallMode {
    #[serde(rename = "install")]
    Install,
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
}

#[derive(CandidType, Deserialize)]
pub struct CanisterInstall {
    mode: InstallMode,
    canister_id: Principal,
    #[serde(with = "serde_bytes")]
    wasm_module: Vec<u8>,
    arg: Vec<u8>,
}

#[derive(CandidType, Clone, Deserialize)]
struct CanisterSettings {
    // dfx versions <= 0.8.1 (or other wallet callers expecting version 0.1.0 of the wallet)
    // will set a controller (or not) in the the `controller` field:
    controller: Option<Principal>,
    // dfx versions >= 0.8.2 will set 0 or more controllers here:
    controllers: Option<Vec<Principal>>,
    compute_allocation: Option<Nat>,
    memory_allocation: Option<Nat>,
    freezing_threshold: Option<Nat>,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct CreateCanisterArgs<TCycles> {
    pub cycles: TCycles,
    pub settings: Option<CanisterSettings>,
}

#[derive(CandidType, Deserialize)]
struct CreateResult {
    canister_id: Principal,
}

/**
 * Utility
 */

 #[derive(CandidType, Deserialize)]
struct PublicKeyReply {
    pub public_key: Vec<u8>,
}

fn pubkey_bytes_to_address(pubkey_bytes: &[u8]) -> String {
    use ethers_core::k256::elliptic_curve::sec1::ToEncodedPoint;
    use ethers_core::k256::Secp256k1;

    let key: ethers_core::k256::elliptic_curve::PublicKey<Secp256k1> =
        ethers_core::k256::elliptic_curve::PublicKey::from_sec1_bytes(pubkey_bytes).expect("failed to parse the public key as SEC1");
    let point = key.to_encoded_point(false);
    // we re-encode the key to the decompressed representation.
    let point_bytes: &[u8] = point.as_bytes();
    assert_eq!(point_bytes[0], 0x04);

    let hash = ethers_core::utils::keccak256(&point_bytes[1..]);
    
    ethers_core::utils::to_checksum(&ethers_core::types::Address::from_slice(&hash[12..32]), None)
}

#[derive(Default, CandidType, Clone, Deserialize, Serialize, Debug)]
pub struct Wallet {
    pub id: String,
    pub name: String,
    pub address: String,
}

async fn get_publickey(id: String) -> Result<Vec<u8>, String> {
    let (pubkey_result,): (Result<PublicKeyReply, String>,) = ic_cdk::call(Principal::from_text(id.clone()).unwrap(), "public_key", ())
    .await
    .unwrap();
    
    let pubkey_reply = match pubkey_result {
        Ok(pubkey) => pubkey,
        Err(e) => {
            return Err(format!("Failed to get public key: {}", e));
        }
    };

    Ok(pubkey_reply.public_key)
}

async fn get_address(id: String) -> String {
    let (pubkey_result,): (Result<PublicKeyReply, String>,) = ic_cdk::call(Principal::from_text(id.clone()).unwrap(), "public_key", ())
    .await
    .unwrap();
    
    let pubkey_reply = match pubkey_result {
        Ok(pubkey) => pubkey,
        Err(e) => {
            return format!("Failed to get public key: {}", e);
        }
    };
    
    let addr = pubkey_bytes_to_address(&pubkey_reply.public_key);

    addr
}


static RPC_SERVICE : RpcService = RpcService::EthSepolia(crate::rpc::EthSepoliaService::PublicNode);

impl Wallet {

    pub async fn get_address(&self) -> String {
        get_address(self.id.to_string()).await
    }

    pub async fn get_nonce(&self) -> u64 {
        let payload = format!(r#"{{"jsonrpc":"2.0","method":"eth_getTransactionCount","params":["{}","latest"],"id":1}}"#, self.address);
        const MAX_RESPONSE_SIZE: u64 = 1000;
        let canister_id = Principal::from_text("7hfb6-caaaa-aaaar-qadga-cai").unwrap();
        let params = (
            &RPC_SERVICE,
            payload,
            MAX_RESPONSE_SIZE,
        );

        let (cycles_result,): (Result<u128, String>,) =
            ic_cdk::api::call::call(canister_id, "requestCost", params.clone())
                .await
                .unwrap();

        let cycles = cycles_result.unwrap_or_else(|e| {
            ic_cdk::trap(&format!("error in `request_cost`: {:?}", e))
        });

        let (result,): (Result<String, String>,) =
            ic_cdk::api::call::call_with_payment128(canister_id, "request", params, cycles)
                .await
                .unwrap();

        ic_cdk::println!("RPC result: {:?}", result);

        match result {
            Ok(response) => {
                match u64::from_str_radix(&response[36..response.len() - 2], 16) {
                    Ok(nonce) => nonce,
                    Err(e) => {
                        ic_cdk::trap(&format!(
                            "error parsing nonce from response: {:?}, response: {:?}",
                            e, response
                        ))
                    }
                }
            }
            Err(err) => ic_cdk::trap(&format!("error in `request` with cycles: {:?}", err)),
        }
    }

    pub async fn get_balance(&self) -> u128 {
        let payload = format!(r#"{{"jsonrpc":"2.0","method":"eth_getBalance","params":["{}","latest"],"id":1}}"#, self.address);
        const maxResponseSize : u64 = 1000;
        let canisterId  = Principal::from_text("7hfb6-caaaa-aaaar-qadga-cai").unwrap();
        let params = (
            &RPC_SERVICE,
            payload,
            maxResponseSize,
        );

        let (cycles_result,): (Result<u128, String>,) =
            ic_cdk::api::call::call( canisterId, "requestCost", params.clone())
                .await
                .unwrap();

        let cycles = cycles_result
            .unwrap_or_else(|e| ic_cdk::trap(&format!("error in `request_cost`: {:?}", e)));


        let (result,): (Result<String, String>,) =
        ic_cdk::api::call::call_with_payment128(canisterId, "request", params, cycles)
            .await
            .unwrap();

        ic_cdk::println!("RPC result: {:?}", result);

        match result {
            Ok(response) => {
                match u128::from_str_radix(&response[36..response.len() - 2], 16) {
                    Ok(balance) => balance,
                    Err(e) => {
                        ic_cdk::trap(&format!(
                            "error parsing balance from response: {:?}, response: {:?}",
                            e, response
                        ))
                    }
                }
            }
            Err(err) => ic_cdk::trap(&format!("error in `request` with cycles: {:?}", err)),
        }
    }

    // cwasoo -> crossaint (also known as wasm)
    pub async fn new(name: String, cwasoo: Vec<u8>) -> Result<Self, String> {
        // Deploy canister
        let management_canister = Principal::management_canister();

        // 100,000,000,000 cycles for creation  
        let create_result: Result<(CreateResult,), _> = api::call::call_with_payment128(
            management_canister,
            "create_canister",
            (),
            100000000000u128,
        )
        .await;

        let create_result = match create_result {
            Ok((result,)) => result,
            Err((code, msg)) => {
                ic_cdk::api::print(format!(
                    "Error creating canister: Code: {}, Message: {}",
                    code as u8, msg
                ));
                return Err(format!("Failed to create canister: {}: {}", code as u8, msg));
            }
        };

        let install_config = CanisterInstall {
            mode: InstallMode::Install,
            canister_id: create_result.canister_id,
            wasm_module: cwasoo.clone(),
            arg: b" ".to_vec(),
        };

        match api::call::call(
            Principal::management_canister(),
            "install_code",
            (install_config,),
        )
        .await
        {
            Ok(x) => x,
            Err((code, msg)) => {
                return Err(format!(
                    "An error happened during the call: {}: {}",
                    code as u8, msg
                ))
            }
        };

        let id = create_result.canister_id.to_text().clone();
        let address = get_address(id.clone()).await;

        Ok(Self {
            id: id,
            name,
            address: address,
        })
    }
}

