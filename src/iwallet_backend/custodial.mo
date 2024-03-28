import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Cycles "mo:base/ExperimentalCycles";
import Result "mo:base/Result";
import Nat64 "mo:base/Nat64";
import evm_rpc "canister:evm_rpc";

actor class CustodialWallet() = self {
  type IC = actor {
    ecdsa_public_key : ({
      canister_id : ?Principal;
      derivation_path : [Blob];
      key_id : { curve: { #secp256k1; } ; name: Text };
    }) -> async ({ public_key : Blob; chain_code : Blob; });
    sign_with_ecdsa : ({
      message_hash : Blob;
      derivation_path : [Blob];
      key_id : { curve: { #secp256k1; } ; name: Text };
    }) -> async ({ signature : Blob });
  };
  

  let ic : IC = actor "aaaaa-aa" : IC;

  public func getId() : async Principal {
    let result = Principal.fromActor(self);
    return result;
  };

  public shared (msg) func getBalance(address: Text) : async { #Ok : Text;  #Err : Text } {
    let rpcService : evm_rpc.RpcService = #Custom({
      url = "https://cloudflare-eth.com";
      headers = null;
    });

    let payload = "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"" # address # "\", \"latest\"],\"id\":1}";
    let maxResponseBytes : Nat64 = 400;

    Cycles.add<system>(230000000);

    let result = await evm_rpc.request(rpcService, payload, maxResponseBytes);
    switch (result) {
        case (#Ok(response)) {
            return #Ok(response);
        };
        case (#Err(error)) {
            return #Err("Failed to get balance.");
        };
    };
  };

  public shared (msg) func sign(message_hash: Blob) : async { #Ok : { signature: Blob };  #Err : Text } {
    assert(message_hash.size() == 32);
    let caller = Principal.toBlob(msg.caller);
    try {
      Cycles.add<system>(10_000_000_000);

      let { signature } = await ic.sign_with_ecdsa({
          message_hash;
          derivation_path = [ caller ];
          key_id = { curve = #secp256k1; name = "dfx_test_key" };
      });
      #Ok({ signature })
    } catch (err) {
      #Err(Error.message(err))
    }
  };

  public shared (msg) func public_key() : async { #Ok : { public_key: Blob }; #Err : Text } {
      let caller = Principal.toBlob(msg.caller);
      
      try {
        let { public_key } = await ic.ecdsa_public_key({
            canister_id = null;
            derivation_path = [ caller ];
            // TODO: Change name to test_key_1 on mainnet (https://forum.dfinity.org/t/trying-out-the-ic-web3-library/20618/3)
            // TODO: Ask discord for help regarding this
            key_id = { curve = #secp256k1; name = "dfx_test_key" };
        });
        
        #Ok({ public_key })
      
      } catch (err) {
        #Err(Error.message(err))
      }
  };

};