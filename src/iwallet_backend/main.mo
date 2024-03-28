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
import Source "mo:uuid.mo/async/SourceV4";
import UUID "mo:uuid.mo/UUID";


actor {
  public type WalletError = {
    #notFound;
    #conflict;
  };

  public type Wallet = {
    id : Principal;
    publicKey : Text;
  };

  public type Vault = {
    id : Text;
    name : Text;
    wallets : Buffer.Buffer<Principal>;
  };

  public type VaultMetadata = {
    id : Text;
    name : Text;
  };

  let map = Map.new<Text, Text>();
  type CustodialWallet = Custodial.CustodialWallet;
  let wallets = Map.new<Principal, CustodialWallet>();
  let walletsArray = Buffer.Buffer<Wallet>(0);
  // vault id -> wallets contained
  // vault id -> vault obj
  let vaults = Map.new<Text, Vault>();
  let vaultsArray = Buffer.Buffer<Vault>(0);

  public query func getAll() : async [Wallet] {
    let result = Buffer.toArray(walletsArray);
    return result;
  };

  public func createVault(name : Text) : async Text {
    let g = Source.Source();
    let vaultId = UUID.toText(await g.new());
    let vault = {
      id = vaultId;
      name = name;
      wallets = Buffer.Buffer<Principal>(0);
    };
    let _ = Map.put(vaults, thash, vaultId, vault);
    vaultsArray.add(vault);
    return vaultId;
  };

  public func getVaults() : async [VaultMetadata] {
    let result = Buffer.toArray(vaultsArray);
    return result;
  };

  public func getVault(vaultId : Text) : async Result.Result<VaultMetadata, Text> {
    switch (Map.get(vaults, thash, vaultId)) {
      case null {
        return #err("Vault not found.");
      };
      case (?v) {
        return #ok(v);
      };
    };
  };


  public func getWallets(vaultId : Text) : async [Wallet] {
    // O(1) lookup
    let vault = switch (Map.get(vaults, thash, vaultId)) {
      case null {
        return [];
      };
      case (?v) {
        let result = Buffer.Buffer<Wallet>(0);
        // O(n) lookup
        label walletsF for (walletCanisterId in v.wallets.vals()) {
          // O(1) lookup
          let walletCanister = Map.get(wallets, phash, walletCanisterId);
          switch (walletCanister) {
            case null {
              continue walletsF;
            };
            case (?w) {
              let pubkraw = await w.public_key();
              let pubk = switch (pubkraw) {
                case (#Ok(score)) { score };
                case (#Err(_)) { 
                  continue walletsF;
                };
              };

              let arrayBuf = Blob.toArray(pubk.public_key);
              let walletEntity = {
                id = walletCanisterId;
                publicKey = Hex.encode(arrayBuf);
              };
              result.add(walletEntity);
            };
          };
        };
        // O(n)
        return Buffer.toArray(result);
      };
    };
    return vault;
  };

  public func register(vaultId: Text) : async Result.Result<Wallet, WalletError> {
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

      let vault = switch (Map.get(vaults, thash, vaultId)) {
        case null { return #err(#notFound); };
        case (?v) {
          v.wallets.add(walletCanisterId);
        };
      };

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