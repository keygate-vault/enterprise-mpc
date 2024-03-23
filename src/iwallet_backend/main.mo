import Map "mo:map/Map";
import { thash; n32hash } "mo:map/Map";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Custodial "custodial";
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Hex "mo:encoding.mo/Hex";

actor {
  public type ProfileError = { #notFound; #conflict };

  public type Profile = object {
    email : Text;
    publicKey : Hex.Hex;
  };

  let map = Map.new<Text, Text>();

  type CustodialWallet = Custodial.CustodialWallet;
  let wallets = Map.new<Text, Custodial.CustodialWallet>();

  public func register(email : Text, name : Text) : async Result.Result<Profile, ProfileError> {
    let a = Map.put(map, thash, email, name);

    switch (a) {
      case null {
        Cycles.add<system>(100_000_000_000);
        let w = await Custodial.CustodialWallet();
        let _ = Map.put(wallets, thash, email, w);
        let pubkraw = await w.public_key();
        let pubk = switch(pubkraw) {
          case (#Ok(score)) { score };
          case (#Err(_)) { 
            return #err(#notFound);
           };
        };
        let arrayBuf = Blob.toArray(pubk.public_key);
        return #ok({ 
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