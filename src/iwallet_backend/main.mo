import Map "mo:map/Map";
import { thash; phash; } "mo:map/Map";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Custodial "custodial";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Hex "mo:encoding.mo/Hex";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";

actor {
  public type WalletError = {
    #notFound;
    #conflict;
  };

  public type Wallet = {
    id : Principal;
    publicKey : Text;
  };

  let map = Map.new<Text, Text>();
  type CustodialWallet = Custodial.CustodialWallet;
  let wallets = Map.new<Principal, CustodialWallet>();
  let walletsArray = Buffer.Buffer<Wallet>(0);

  public query func getAll() : async [Wallet] {
    let result = Buffer.toArray(walletsArray);
    return result;
  };

  public func register() : async Result.Result<Wallet, WalletError> {
      Cycles.add<system>(100_000_000_000);

      let walletCanister = await Custodial.CustodialWallet();
      let walletCanisterId = await walletCanister.getId();

      Debug.print("Wallet canister created");
      let _ = Map.put(wallets, phash, walletCanisterId, walletCanister);
      let pubkraw = await walletCanister.public_key();
      let pubk = switch (pubkraw) {
        case (#Ok(score)) { score };
        case (#Err(_)) { return #err(#notFound); };
      };

      let arrayBuf = Blob.toArray(pubk.public_key);
      let walletEntity = {
        id = walletCanisterId;
        publicKey = Hex.encode(arrayBuf);
      };

      walletsArray.add(walletEntity);
      return #ok(walletEntity);
  };

  public query func lookup(email : Text) : async Result.Result<Text, WalletError> {
    let a = Map.get(map, thash, email);
    switch (a) {
      case null {
        return #err(#notFound);
      };
      case (?name) {
        return #ok(name);
      };
    };
  };
};