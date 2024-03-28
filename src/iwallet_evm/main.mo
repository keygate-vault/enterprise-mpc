import Map "mo:map/Map";
import { thash } "mo:map/Map";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Hex "mo:encoding.mo/Hex";
import Nat64 "mo:base/Nat64";
import Custodial "../iwallet_backend/custodial";
import evm_rpc "canister:evm_rpc";

actor class Evm() {
    public func getGasPrice() : async (Result.Result<Text, evm_rpc.RpcError>) {
        let rpcService : evm_rpc.RpcService = #Custom({
            url = "https://cloudflare-eth.com";
            headers = null;
        });

        let payload = "{\"jsonrpc\":\"2.0\",\"method\":\"eth_gasPrice\",\"params\":[],\"id\":1}";
        let maxResponseBytes : Nat64 = 400;

        Cycles.add<system>(230000000);

        let result = await evm_rpc.request(rpcService, payload, maxResponseBytes);
        switch (result) {
            case (#Ok(response)) {
                return #ok(response);
            };
            case (#Err(error)) {
                return #err(error);
            };
        };
    };

    public func getBalance(address : Text) : async (Result.Result<Text, evm_rpc.RpcError>) {
        let rpcService : evm_rpc.RpcService = #Custom({
            url = "https://rpc.sepolia.org/";
            headers = null;
        });

        let payload = "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"" # address # "\", \"latest\"],\"id\":1}";
        let maxResponseBytes : Nat64 = 800;

        Cycles.add<system>(1230000000);

        let result = await evm_rpc.request(rpcService, payload, maxResponseBytes);
        switch (result) {
            case (#Ok(response)) {
                return #ok(response);
            };
            case (#Err(error)) {
                return #err(error);
            };
        };
    };
};
