// useNFID.ts
import { useState, useEffect } from "react";
import { NFID } from "@nfid/embed";
import { NFIDConfig } from "@nfid/embed/src/lib/types";

const useNFID = (config?: NFIDConfig) => {
  const [nfid, setNFID] = useState<NFID | null>(null);

  useEffect(() => {
    const initNFID = async () => {
      const nfidInstance = await NFID.init(config || {});
      setNFID(nfidInstance);
    };

    initNFID();
  }, [config]);

  const isAuthLoading = !NFID.isIframeInstantiated;

  const getDelegation = async (options?: {
    targets?: string[];
    maxTimeToLive?: bigint;
    derivationOrigin?: string | URL;
  }) => {
    if (nfid) {
      return nfid.getDelegation(options);
    }
    throw new Error("NFID instance is not initialized");
  };

  const updateGlobalDelegation = async (options: {
    targets: string[];
    maxTimeToLive?: bigint;
    derivationOrigin?: string | URL;
  }) => {
    if (nfid) {
      return nfid.updateGlobalDelegation(options);
    }
    throw new Error("NFID instance is not initialized");
  };

  const getDelegationType = () => {
    if (nfid) {
      return nfid.getDelegationType();
    }
    throw new Error("NFID instance is not initialized");
  };

  const logout = async () => {
    if (nfid) {
      await nfid.logout();
    }
  };

  const requestTransferFT = async (options: {
    receiver: string;
    amount: string;
    memo?: bigint;
    derivationOrigin?: string | URL;
  }) => {
    if (nfid) {
      return nfid.requestTransferFT(options);
    }
    throw new Error("NFID instance is not initialized");
  };

  const requestTransferNFT = async (options: {
    receiver: string;
    tokenId: string;
    derivationOrigin?: string | URL;
  }) => {
    if (nfid) {
      return nfid.requestTransferNFT(options);
    }
    throw new Error("NFID instance is not initialized");
  };

  const requestCanisterCall = async (options: {
    method: string;
    canisterId: string;
    parameters?: string;
    derivationOrigin?: string | URL;
  }) => {
    if (nfid) {
      return nfid.requestCanisterCall(options);
    }
    throw new Error("NFID instance is not initialized");
  };

  const isAuthenticated = nfid?.isAuthenticated || false;

  const getIdentity = () => {
    return nfid?.getIdentity();
  };

  return {
    nfid,
    getDelegation,
    updateGlobalDelegation,
    getDelegationType,
    logout,
    requestTransferFT,
    requestTransferNFT,
    requestCanisterCall,
    isAuthenticated,
    isAuthLoading,
    getIdentity,
  };
};

export default useNFID;
