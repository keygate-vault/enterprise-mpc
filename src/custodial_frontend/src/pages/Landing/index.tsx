import { Button, Typography } from "antd";
import { EvervaultCard, Icon } from "../../components/Card/EvervaultCard";
import useNFID from "../../hooks/useNFID";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Title, Paragraph } = Typography;

const Landing = () => {
  const { nfid } = useNFID();
  const navigate = useNavigate();

  useEffect(() => {
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
