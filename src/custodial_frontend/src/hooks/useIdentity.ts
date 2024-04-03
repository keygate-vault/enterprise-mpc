import { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import {
  _SERVICE,
  idlFactory,
} from "../../../declarations/custodial_backend/custodial_backend.did.js";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "react-router-dom";

const useIdentity = () => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Identity changed", identity);
  }, [identity]);

  const initIdentity = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);
    const identity = client.getIdentity();
    await setupAgent(identity);
    setIdentity(identity);
  };

  function isAuthReady() {
    return !!authClient;
  }

  function isAuthenticated() {
    if (!authClient) return false;
    const identity = authClient.getIdentity();
    if (!identity) return false;

    if (identity.constructor.name !== "DelegationIdentity") return false;

    return true;
  }

  const setupAgent = async (identity: Identity) => {
    const agent = new HttpAgent({ identity, host: "http://localhost:3000" });
    await agent.fetchRootKey();
    const actorInstance = Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId: Principal.fromText(
        process.env.CANISTER_ID_CUSTODIAL_BACKEND!
      ),
    });

    setActor(actorInstance);
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIdentity(null);
      setActor(undefined);
      navigate(0);
    }
  };

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === "ic"
            ? "https://identity.ic0.app"
            : `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943`,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          setIdentity(identity);
          navigate(0);
        },
      });
    } else {
      console.error("Auth client is not initialized");
    }
  };

  const whoAmI = async () => {
    if (actor) {
      return actor.whoami();
    }
    throw new Error("Actor is not initialized");
  };

  return {
    initIdentity,
    actor,
    identity,
    login,
    whoAmI,
    isAuthenticated,
    isAuthReady,
    logout,
  };
};

export default useIdentity;
