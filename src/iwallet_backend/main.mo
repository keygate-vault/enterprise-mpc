import Map "mo:map/Map";
import { nhash } "mo:map/Map";
import Text "mo:base/Text";
import Result "mo:base/Result";

actor {
  public type ProfileError = { #notFound; #conflict };

  let map = Map.new<Nat, Nat>();

  public query func register(email : Text, name : Text) : async Result.Result<Text, ProfileError> {
    switch (map.get(email)) {
      case (?existingName) {
        return #err(#conflict);
      };
      case null {
        map.put(email, name);
        return #ok(name);
      };
    };
  };

  public query func lookup(email : Text) : async Result.Result<Text, ProfileError> {
    let r = switch (map.get(email)) {
      case (?name) {
        return #ok(name);
      };
      case null {
        return #err(#notFound);
      };
    };
    return r;
  };
};