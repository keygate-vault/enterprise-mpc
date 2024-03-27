import Map "mo:map/Map";
import { thash; } "mo:map/Map";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Custodial "custodial";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Hex "mo:encoding.mo/Hex";
import Nat64 "mo:base/Nat64";

actor {
  public type WalletError = {
    #notFound;
    #conflict;
  };

  public type Wallet = {
    email : Text;
    name : Text;
    publicKey : Text;
  };

  let map = Map.new<Text, Text>();
  type CustodialWallet = Custodial.CustodialWallet;
  let wallets = Map.new<Text, CustodialWallet>();
  let walletsArray = Buffer.Buffer<Wallet>(0);

  public func getAll() : async [Wallet] {
    let result = Buffer.toArray(walletsArray);
    return result;
  };
  

  public func register(email : Text, name : Text) : async Result.Result<Wallet, WalletError> {
    let a = Map.put(map, thash, email, name);
    switch (a) {
      case null {
        Cycles.add<system>(100_000_000_000);
        
        let walletCanister = await Custodial.CustodialWallet();
        let _ = Map.put(wallets, thash, email, walletCanister);
        let pubkraw = await walletCanister.public_key();
        let pubk = switch (pubkraw) {
          case (#Ok(score)) { score };
          case (#Err(_)) { return #err(#notFound); };
        };

        let arrayBuf = Blob.toArray(pubk.public_key);
        let walletEntity = {
          name = name;
          email = email;
          publicKey = Hex.encode(arrayBuf);
        };
        walletsArray.add(walletEntity);
        return #ok(walletEntity);
      };
      case (?name) {
        return #err(#conflict);
      };
    };
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