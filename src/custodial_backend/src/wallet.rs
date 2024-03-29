use candid::{CandidType, Nat, Principal};
use ic_cdk::{api, caller};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

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

#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct Wallet {
    pub id: String,
    pub name: String,
}

#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct Wallets {
    pub wallets: BTreeMap<String, Wallet>,
}

impl Wallet {
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
        })
    }
}