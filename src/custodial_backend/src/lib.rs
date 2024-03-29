mod vault;
mod wallet;

use ic_cdk::{init, query, update};
use vault::{Vault, Vaults};
use wallet::{Wallet, Wallets};
use std::cell::RefCell;

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
fn get_vaults() -> Vaults {
    VAULTS.with(|vaults| {
        vaults.borrow().clone()
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
async fn create_wallet(name: String) -> wallet::Wallet {
    let wasm = get_wallet_wasm();
    let wallet = Wallet::new(name, wasm).await;
    if let Err(e) = &wallet {
        ic_cdk::trap(&format!("Failed to create wallet: {}", e));
    }

    wallet.unwrap()
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