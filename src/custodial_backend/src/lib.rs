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
    let vault = Vault::new(name).await;
    if let Err(e) = &vault {
        ic_cdk::trap(&format!("Failed to create vault: {}", e));
    }

    let vault = vault.unwrap();

    VAULTS.with(|vaults| {
        vaults.borrow_mut().add_vault(vault.clone());
    });

    vault
}

#[update]
async fn create_wallet(name: String, vault_id: String) -> Option<Wallet> {
    // check if vault exists
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