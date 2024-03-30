import { Button, Typography } from "antd";
import useNFID from "../../hooks/useNFID";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Title, Paragraph } = Typography;

const Landing = () => {
    const { isAuthenticated, isAuthLoading, nfid } = useNFID();

    const navigate = useNavigate();

    useEffect(() => {
      if (isAuthenticated && !isAuthLoading) {
        console.log("Authenticated");
        navigate("/vaults");
      }

      login();
    });

  const login = async () => {
    if (nfid) {
      try {
        await nfid.getDelegation();
        navigate("/vaults");
      } catch (e) {
        console.error(e);
      }
    }
  };

  return <></>;
};

export default Landing;
