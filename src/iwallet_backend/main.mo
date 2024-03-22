import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";

actor {
  public type ProfileError = { #notFound; #conflict };

  let map = HashMap.HashMap<Text, Text>(5, Text.equal, Text.hash);

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
    switch (map.get(email)) {
      case (?name) {
        return #ok(name);
      };
      case null {
        return #err(#notFound);
      };
    };
  };
};