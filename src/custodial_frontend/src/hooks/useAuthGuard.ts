import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNFID from "./useNFID";
import { NFID } from "@nfid/embed";

const useAuthGuard = () => {
  const { getIdentity, isAuthenticated, isAuthLoading } = useNFID();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated && !isAuthLoading) {
        navigate("/");
      }
    };

    checkAuth();
  }, [getIdentity, navigate, isAuthenticated]);
};

export default useAuthGuard;
