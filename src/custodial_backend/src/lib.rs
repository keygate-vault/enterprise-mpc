mod rpc;
mod vault;
mod wallet;
mod user;

use candid::Principal;
use ic_cdk::{api::{self, management_canister::{self, main::{CanisterSettings, CreateCanisterArgument, UpdateSettingsArgument}}}, init, post_upgrade, query, update};
use vault::{Vault, Vaults};
use wallet::Wallet;
use user::{User, Users};
use std::{cell::RefCell, collections::BTreeMap, str::FromStr};

thread_local! {
    static VAULTS: RefCell<Vaults> = RefCell::default();
    static WALLET_WASM: RefCell<Option<Vec<u8>>> = RefCell::new(None);
    static USERS: RefCell<Users> = RefCell::default();
    static INITIALIZED: RefCell<bool> = RefCell::new(false);
    static SUPERADMIN: RefCell<Option<Principal>> = RefCell::new(None);
}

#[init]
fn init() {
    load_wallet_wasm();
}

#[post_upgrade]
fn post_upgrade() {
    load_wallet_wasm();
}

#[query]
fn get_vault(id: String) -> Option<Vault> {
    VAULTS.with(|vaults| vaults.borrow().get_vault(&id).cloned())
}

#[query]
fn get_vaults() -> BTreeMap<String, Vault> {
    VAULTS.with(|vaults| vaults.borrow().vaults.clone())
}

#[update]
async fn create_vault(name: String) -> Vault {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Cannot create vault anonymously. Please log in.");
    }

    let user = USERS.with(|users| users.borrow().get_user(&caller.to_string()).cloned());
    if user.is_none() {
        ic_cdk::trap("User not found. Please create a user first.");
    }

    let role = user.unwrap().role;
    let vault = Vault::new(name, role).await;
    if let Err(e) = &vault {
        ic_cdk::trap(&format!("Failed to create vault: {}", e));
    }

    let vault = vault.unwrap();

    VAULTS.with(|vaults| {
        vaults.borrow_mut().add_vault(vault.clone());
    });

    vault
}

fn has_higher_access_level(caller_access_level: &str, current_access_level: &str) -> bool {
    let access_levels = vec!["user", "admin", "superadmin"];
    let caller_index = access_levels.iter().position(|&r| r == caller_access_level).unwrap_or(0);
    let current_index = access_levels.iter().position(|&r| r == current_access_level).unwrap_or(0);
    caller_index > current_index
}

#[update]
fn change_vault_access_level(vault_id: String, new_access_level: String) {
    let caller = ic_cdk::caller();
    let user = USERS.with(|users| users.borrow().get_user(&caller.to_string()).cloned());

    if let Some(user) = user {
        let vault = VAULTS.with(|vaults| vaults.borrow().get_vault(&vault_id).cloned());

        if let Some(vault) = vault {
            let caller_access_level = user.role.clone();
            let current_access_level = vault.access_level.clone();

            if has_higher_access_level(&caller_access_level, &current_access_level) {
                VAULTS.with(|vaults| {
                    vaults.borrow_mut().update_vault_access_level(&vault_id, new_access_level);
                });
            } else {
                ic_cdk::trap("Caller does not have sufficient access level to change vault access level");
            }
        } else {
            ic_cdk::trap("Vault not found");
        }
    } else {
        ic_cdk::trap("User not found");
    }
}

#[update]
async fn create_wallet(name: String, vault_id: String) -> Option<Wallet> {
    let exists = VAULTS.with(|vaults| vaults.borrow().get_vault(&vault_id).is_some());

    if !exists {
        return None;
    }

    let wallet = Wallet::new(name, get_wallet_wasm()).await;
    if let Err(e) = &wallet {
        ic_cdk::trap(&format!("Failed to create wallet: {}", e));
    }

    ic_cdk::println!("Wallet created: {:?}", wallet);

    let wallet = wallet.unwrap();

    VAULTS.with(|vaults| {
        vaults.borrow_mut().add_wallet(&vault_id, wallet.clone());
    });

    Some(wallet)
}

#[update(composite = true)]
async fn get_balance(vault_id: String, wallet_id: String) -> Option<u128> {
    let wallet = VAULTS.with(|vaults| {
        vaults.borrow().get_wallet(&vault_id, &wallet_id).cloned()
    });

    match wallet {
        Some(mut wallet) => Some(wallet.get_balance().await),
        None => None,
    }
}

#[update]
async fn get_address(vault_id: String, wallet_id: String) -> Option<String> {
    let wallet = VAULTS.with(|vaults| vaults.borrow().get_wallet(&vault_id, &wallet_id).cloned());

    match wallet {
        Some(mut wallet) => Some(wallet.get_address().await),
        None => None,
    }
}

#[update]
fn load_wallet_wasm() {
    let wasm_module: Vec<u8> = include_bytes!("../../../mpc_wallet.wasm").to_vec();
    WALLET_WASM.with(|wasm| {
        *wasm.borrow_mut() = Some(wasm_module);
    });
}

#[query]
fn get_wallet_wasm() -> Vec<u8> {
    WALLET_WASM.with(|wasm| wasm.borrow().clone().unwrap())
}

#[update]
async fn create_user(username: String, role: String) -> User {
    let caller = ic_cdk::caller();

    if caller == Principal::anonymous() {
        ic_cdk::trap("Cannot create user anonymously. Please log in.");
    }

    let mut is_super = false;
    if SUPERADMIN.with(|superadmin| superadmin.borrow().is_none()) {
        is_super = true;
        SUPERADMIN.with(|superadmin| {
            *superadmin.borrow_mut() = Some(caller);
        });
    }

    let use_role = if is_super { String::from_str("superadmin") } else { Ok(role.clone()) };
    let user = User::new(caller, username, use_role.unwrap()).await;

    let user = user.unwrap();

    USERS.with(|users| {
        users.borrow_mut().create_user(user.clone());
    });


    user
}

#[query]
fn get_user(id: String) -> Option<User> {
    USERS.with(|users| users.borrow().get_user(&id).cloned())
}

#[query]
fn get_users() -> BTreeMap<String, User> {
    USERS.with(|users| users.borrow().users.clone())
}

#[update]
fn set_user_status(id: String, status: String) {
    let caller = ic_cdk::caller();
    
    if caller != SUPERADMIN.with(|superadmin| superadmin.borrow().clone().unwrap()) {
        ic_cdk::trap("Only superadmin can set user status");
    }
    
    USERS.with(|users| {
        users.borrow_mut().set_user_status(&id, status);
    });
}

#[update]
async fn setup() -> Principal {
    if INITIALIZED.with(|initialized| *initialized.borrow()) {
        ic_cdk::trap("Already initialized");
    }

    let caller : Principal = ic_cdk::api::caller();
    SUPERADMIN.with(|superadmin| {
        *superadmin.borrow_mut() = Some(caller);
    });

    INITIALIZED.with(|initialized| {
        *initialized.borrow_mut() = true;
    });

    caller
}

#[query]
fn whoami() -> Principal {
    return ic_cdk::api::caller();
}

#[query]
fn superadmin() -> Option<Principal> {
    return SUPERADMIN.with(|superadmin| {
        superadmin.borrow().clone()
    });
}

ic_cdk::export_candid!();