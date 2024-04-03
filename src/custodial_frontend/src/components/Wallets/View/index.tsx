import { Button, Modal, notification, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { keccak256, sha3_256 } from "js-sha3";
import { Buffer } from "buffer";
import RIPEMD160 from "ripemd160";
import CryptoJS from "crypto-js";
import { bech32 } from "bech32";

const { TabPane } = Tabs;

type User = {
  name: string;
  email: string;
  publicKey: string;
};

type Wallet = {
  address: string;
  balance: number;
  usdBalance: number;
};

const ethLogo = (
  <svg
    width="32px"
    height="32px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 24.003c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12Z"
      fill="#627EEA"
    ></path>
    <path
      d="M12.373 3.003v6.652l5.623 2.513-5.622-9.165Z"
      fill="#fff"
      fill-opacity="0.602"
    ></path>
    <path d="M12.373 3.003 6.75 12.168l5.623-2.513V3.003Z" fill="#fff"></path>
    <path
      d="M12.373 16.48V21L18 13.214l-5.627 3.264Z"
      fill="#fff"
      fill-opacity="0.602"
    ></path>
    <path d="M12.373 21v-4.52L6.75 13.214 12.373 21Z" fill="#fff"></path>
    <path
      d="m12.373 15.433 5.623-3.265-5.622-2.511v5.776Z"
      fill="#fff"
      fill-opacity="0.2"
    ></path>
    <path
      d="m6.75 12.168 5.623 3.265V9.657l-5.623 2.51Z"
      fill="#fff"
      fill-opacity="0.602"
    ></path>
  </svg>
);

const btcLogo = (
  <svg
    width="32px"
    height="32px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M24 12.003a12 12 0 1 1-24 0 12 12 0 0 1 24 0Z"
      fill="#F7931A"
    ></path>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="m8.529 5.483 2.758.738.616-2.297 1.379.374-.593 2.203 1.125.302.594-2.227 1.402.375-.604 2.239s2.291.507 2.83 2.37c.539 1.864-1.185 2.842-1.717 2.88 0 0 2.007 1.1 1.318 3.266-.69 2.165-2.806 2.552-5.033 2.056L12 20.084l-1.403-.376.617-2.285-1.113-.303-.617 2.301-1.392-.374.618-2.29-2.831-.764.713-1.584s.799.218 1.101.29c.302.072.496-.242.582-.557.085-.314 1.366-5.52 1.488-5.95.12-.428.072-.763-.437-.895-.508-.132-1.2-.338-1.2-.338l.403-1.476Zm2.781 6.895-.763 3.036s3.787 1.367 4.27-.556c.485-1.923-3.507-2.48-3.507-2.48Zm.352-1.44.75-2.781s3.241.58 2.842 2.128c-.4 1.548-2.31.954-3.592.653Z"
      fill="#fff"
    ></path>
  </svg>
);

const WalletDetail = () => {
  const [user, setUser] = useState<User | null>(null);
  const [api] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  function publicKeyToETHAddress(publicKey: string): string {
    try {
      // Remove the leading '0x' if present
      const trimmedPublicKey = publicKey.startsWith("0x")
        ? publicKey.slice(2)
        : publicKey;

      // Keccak-256 hash of the public key bytes
      const hash = keccak256(Buffer.from(trimmedPublicKey, "hex"));

      // Take the last 20 bytes and add the '0x' prefix for ETH address format
      return `0x${hash.slice(-40)}`;
    } catch (error) {
      console.error("Error converting to ETH address:", error);
      throw error; // Re-throw the error for handling upstream
    }
  }

  function publicKeyToBTCAddress(publicKey: string): string {
    try {
      const sha256Hash = sha3_256(Buffer.from(publicKey, "hex"));

      const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString(
        CryptoJS.enc.Hex
      );

      const bech32Words = bech32.toWords(Buffer.from(ripemd160Hash, "hex"));
      const words = new Uint8Array([0, ...bech32Words]);

      const address = bech32.encode("bc", words);

      return address;
    } catch (error) {
      console.error("Error converting to BTC SegWit address:", error);
      return "";
    }
  }

  const [ethWallets] = useState<Wallet[]>([
    {
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      balance: 2.5,
      usdBalance: 4837.5,
    },
  ]);

  const [btcWallets] = useState<Wallet[]>([
    {
      address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      balance: 0.1,
      usdBalance: 2700.0,
    },
  ]);

  useEffect(() => {
    if (!email) {
      // navigate("/");
    } else {
      fetchWalletDetail();
    }
  }, [email, navigate]);

  const fetchWalletDetail = async () => {
    try {
      setIsLoading(true);
      setIsLoading(false);
      setUser({
        // mock
        name: "John Doe",
        email: email!,
        publicKey:
          "03cacb94a9bc944ecee5fe8954528442e71227317f4031f6d3a567380bb549c579",
      });
    } catch (error) {
      api.error({
        message: "Error fetching wallet detail",
        description: "Please try again later.",
        placement: "bottom",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-left p-16">
      <h1 className="text-3xl font-bold">Wallet Detail</h1>
      {user && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Balance</h3>
            <p className="text-4xl font-bold">$35.97</p>
          </div>
          <div className="mt-8">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Vault" key="1">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Vault Funding</h3>
                  <p className="text-gray-500">$0</p>
                  {ethWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center mb-4">
                      {ethLogo}
                      <div className="ml-4">
                        <p className="text-gray-500">
                          {publicKeyToETHAddress(user.publicKey)}
                        </p>
                        <p className="font-bold">
                          {wallet.balance} ETH ($
                          {wallet.usdBalance.toLocaleString()})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabPane>
              <TabPane tab="Exchanges" key="2">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Exchange accounts</h3>
                  <p className="text-gray-500 mb-4">
                    Connect main, sub, and trading accounts
                  </p>
                  <Button type="primary" className="mb-8">
                    Connect account
                  </Button>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-2">Fund accounts</h4>
                    <p className="text-gray-500">
                      Deposit, withdraw, and rebalance between connected
                      accounts.
                    </p>
                  </div>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-2">Monitor balances</h4>
                    <p className="text-gray-500">
                      Keep an eye on assets, balances, and transactions.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      Transfer anywhere
                    </h4>
                    <p className="text-gray-500">
                      Move funds to vaults, exchanges, and addresses.
                    </p>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Fiat" key="3">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">Fiat accounts</h3>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-2">
                      Connect fiat accounts
                    </h4>
                    <p className="text-gray-500 mb-4">
                      This feature allows you to instantly move funds between
                      your bank accounts to exchanges and custodial wallets.
                    </p>
                    <Button type="primary">Connect account</Button>
                  </div>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-2">
                      Settle seamlessly
                    </h4>
                    <p className="text-gray-500">
                      Transfer fiat to blockchain addresses.
                    </p>
                  </div>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-2">Fund exchanges</h4>
                    <p className="text-gray-500">
                      Send fiat directly to exchanges.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Manage balances</h4>
                    <p className="text-gray-500">
                      Deposit, withdraw, and monitor connected accounts.
                    </p>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      )}
    </main>
  );
};

export default WalletDetail;
