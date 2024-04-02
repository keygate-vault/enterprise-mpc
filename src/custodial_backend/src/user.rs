use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub role: String,
    pub status: String,
}

impl User {
    pub async fn new(username: String, role: String) -> Result<Self, String> {
        let (bytes,): (Vec<u8>,) = ic_cdk::call(
            Principal::management_canister(),
            "raw_rand",
            (),
        )
        .await
        .map_err(|e| format!("Failed to generate random ID."))?;

        let id = hex::encode(bytes);
        let status = "active".to_string(); // Set default status to "active"
        Ok(Self { id, username, role, status })
    }
}

#[derive(Default, CandidType, Clone, Deserialize, Serialize)]
pub struct Users {
    pub users: BTreeMap<String, User>,
}

impl Users {
    pub fn create_user(&mut self, user: User) {
        self.users.insert(user.id.clone(), user);
    }

    pub fn get_user(&self, id: &str) -> Option<&User> {
        self.users.get(id)
    }

    pub fn set_user_status(&mut self, id: &str, status: String) {
        if let Some(user) = self.users.get_mut(id) {
            user.status = status;
        }
    }
}