mod vault;
mod wallet;

use ic_cdk::{init, query, update};
use vault::{Vault, Vaults};
use wallet::{Wallet};
use std::{cell::RefCell, collections::BTreeMap};

thread_local! {
    static VAULTS: RefCell<Vaults> = RefCell::default();
    static WALLET_WASM: RefCell<Option<Vec<u8>>> = RefCell::new(None);
}

#[init]
fn init() {
    load_wallet_wasm();
}

#[query]
fn get_vault(id: String) -> Option<Vault> {
    VAULTS.with(|vaults| {
        vaults.borrow().get_vault(&id).cloned()
    })
}

#[query]
fn get_vaults() -> BTreeMap<String, Vault> {
    VAULTS.with(|vaults| {
        vaults.borrow().vaults.clone()
    })
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
    let exists = VAULTS.with(|vaults| {
        vaults.borrow().get_vault(&vault_id).is_some()
    });

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

#[update]
async fn get_address(vault_id: String, wallet_id: String) -> Option<String> {
    let wallet = VAULTS.with(|vaults| {
        vaults.borrow().get_wallet(&vault_id, &wallet_id).cloned()
    });

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
    WALLET_WASM.with(|wasm| {
        wasm.borrow().clone().unwrap()
    })
}

ic_cdk::export_candid!();