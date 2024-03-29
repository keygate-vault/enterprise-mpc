use candid::{CandidType, Nat, Principal};
use ic_cdk::{api, caller};
use serde::{Deserialize, Serialize};

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

#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct Wallet {
    pub id: String,
    pub name: String,
    pub address: Option<String>,
}

impl Wallet {
    pub async fn get_address(&self) -> String {
        // call wallet canister (using id)
        // public_key() -> Result<PublicKeyReply, String>
        let (pubkey_result,): (Result<PublicKeyReply, String>,) = api::call::call(
            Principal::from_text(self.id.clone()).unwrap(),
            "public_key",
            (),
        )
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

        Ok(Self {
            id: create_result.canister_id.to_text(),
            name,
            address: None
        })
    }
}

