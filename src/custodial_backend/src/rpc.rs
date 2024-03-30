use candid::CandidType;
use ic_cdk::api::management_canister::http_request::HttpHeader;
use serde::{Deserialize, Serialize};


#[derive(Clone, PartialEq, Eq, Ord, PartialOrd, Hash, Serialize, Deserialize, CandidType)]
pub struct RpcApi {
    pub url: String,
    pub headers: Option<Vec<HttpHeader>>,
}

#[derive(
    Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Hash, Serialize, Deserialize, CandidType,
)]
pub enum EthMainnetService {
    Alchemy,
    Ankr,
    BlockPi,
    PublicNode,
    Cloudflare,
}

#[derive(
    Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Hash, Serialize, Deserialize, CandidType,
)]
pub enum EthSepoliaService {
    Alchemy,
    Ankr,
    BlockPi,
    PublicNode,
}

#[derive(Clone, PartialEq, Eq, Ord, PartialOrd, Hash, Serialize, Deserialize, CandidType)]
pub enum RpcService {
    EthMainnet(EthMainnetService),
    EthSepolia(EthSepoliaService),
    Chain(u64),
    Provider(u64),
    Custom(RpcApi),
}
