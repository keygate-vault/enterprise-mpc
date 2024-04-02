use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use hex;

use crate::wallet::Wallet;


#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct Vault {
    pub id: String,
    pub name: String,
    pub wallets: BTreeMap<String, Wallet>,
    pub access_level: String,
}

impl Vault {
    pub async fn new(name: String, access_level: String) -> Result<Self, String> {
        let (bytes,): (Vec<u8>,) = ic_cdk::call(
            Principal::management_canister(),
            "raw_rand",
            (),
        )
        .await
        .map_err(|e| format!("Failed to generate random ID."))?;

        let id = hex::encode(bytes);
        Ok(Self { id, name, access_level, wallets: BTreeMap::new()})
    }

    pub fn add_wallet(&mut self, wallet: Wallet) {
        self.wallets.insert(wallet.id.clone(), wallet);
    }

    pub fn get_wallet(&self, id: &str) -> Option<&Wallet> {
        self.wallets.get(id)
    }
    
}

#[derive(CandidType, Clone, Deserialize, Serialize, Default)]
pub struct Vaults {
    pub vaults: BTreeMap<String, Vault>,
}

impl Vaults {
    pub fn new() -> Self {
        Self {
            vaults: BTreeMap::new(),
        }
    }

    pub fn add_vault(&mut self, vault: Vault) {
        self.vaults.insert(vault.id.clone(), vault);
    }

    pub fn get_vault(&self, id: &str) -> Option<&Vault> {
        self.vaults.get(id)
    }

    pub fn add_wallet(&mut self, vault_id: &str, wallet: Wallet) -> Option<()> {
        if let Some(vault) = self.vaults.get_mut(vault_id) {
            vault.add_wallet(wallet);
            Some(())
        } else {
            None
        }
    }

    pub fn exists(&self, id: &str) -> bool {
        self.vaults.contains_key(id)
    }

    pub fn get_wallet(&self, vault_id: &str, wallet_id: &str) -> Option<&Wallet> {
        self.vaults.get(vault_id).and_then(|vault| vault.get_wallet(wallet_id))
    }

    pub fn update_vault(&mut self, id: &str, name: String) -> Option<()> {
        if let Some(vault) = self.vaults.get_mut(id) {
            vault.name = name;
            Some(())
        } else {
            None
        }
    }
    
    pub fn update_vault_access_level(&mut self, id: &str, access_level: String) -> Option<()> {
        if let Some(vault) = self.vaults.get_mut(id) {
            vault.access_level = access_level;
            Some(())
        } else {
            None
        }
    }
}