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

actor {
  public type ProfileError = {
    #notFound;
    #conflict;
  };

  public type Profile = {
    email : Text;
    name : Text;
    publicKey : Text;
  };

  let map = Map.new<Text, Text>();
  type CustodialWallet = Custodial.CustodialWallet;
  let wallets = Map.new<Text, CustodialWallet>();

  public func getAll() : async [Profile] {
    let keys = Map.keys(map);
    let size = Map.size(map);
    let profiles = Buffer.Buffer<Profile>(size);
    for (key in keys) {
      let name = Map.get(map, thash, key);
      switch (name) {
        case (?n) {
          let wallet = Map.get(wallets, thash, key);
          switch (wallet) {
            case (?w) {
              let pubkraw = await w.public_key();
              let pubk = switch (pubkraw) {
                case (#Ok(score)) { score.public_key };
                case (#Err(_)) { Text.encodeUtf8("Error retrieving public key") };
              };
              let arrayBuf = Blob.toArray(pubk);
              profiles.add({
                name = n;
                email = key;
                publicKey = Hex.encode(arrayBuf);
              });
            };
            case (null) {
              Debug.print("Error: wallet not found for " # key);
            };
          };
        };
        case (null) {
          Debug.print("Error: key not found");
        };
      };
    };

    return Buffer.toArray(profiles);
  };

  public func register(email : Text, name : Text) : async Result.Result<Profile, ProfileError> {
    let a = Map.put(map, thash, email, name);
    switch (a) {
      case null {
        Cycles.add<system>(100_000_000_000);
        let w = await Custodial.CustodialWallet();
        let _ = Map.put(wallets, thash, email, w);
        let pubkraw = await w.public_key();
        let pubk = switch (pubkraw) {
          case (#Ok(score)) { score };
          case (#Err(_)) { return #err(#notFound); };
        };
        let arrayBuf = Blob.toArray(pubk.public_key);
        return #ok({
          name = name;
          email = email;
          publicKey = Hex.encode(arrayBuf);
        });
      };
      case (?name) {
        return #err(#conflict);
      };
    };
  };

  public query func lookup(email : Text) : async Result.Result<Text, ProfileError> {
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