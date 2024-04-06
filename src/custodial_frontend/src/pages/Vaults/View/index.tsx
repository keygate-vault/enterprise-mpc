import { Button, Dropdown, Menu, notification, Tabs } from "antd";
import { useEffect, useState } from "react";
import { custodial_backend } from "../../../../../declarations/custodial_backend";
import { useNavigate, useParams } from "react-router-dom";
import { keccak256 } from "js-sha3";
import { Buffer } from "buffer";
import { LeftOutlined, PlusOutlined, WalletFilled } from "@ant-design/icons";
import CreateWalletModal from "../../../components/Wallets/Create";
import web3 from "web3";
import TransferModal from "../../../components/TransferModal";

const { TabPane } = Tabs;

type Vault = {
  id: string;
  name: string;
  blockchain: string;
};

type Wallet = {
  id: string;
  address?: string;
  balance: string;
  balanceLoading: boolean;
};

const ethLogo = <img src="/eth.svg" alt="ETH" className="w-[32px] h-[32px]" />;

const VaultDetail = () => {
  const [vault, setVault] = useState<Vault | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [api] = notification.useNotification();
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [fromWallet, setFromWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!id) {
      // navigate("/");
    } else {
      fetchWalletDetail();
    }
  }, [id, navigate]);

  useEffect(() => {
    const calculateTotalBalance = () => {
      const total = wallets.reduce((acc, wallet) => {
        const balance =
          parseFloat(web3.utils.fromWei(wallet.balance, "ether")) || 0;
        return acc + balance;
      }, 0);
      setTotalBalance(total);
    };

    calculateTotalBalance();
  }, [wallets]);

  const loadWalletBalance = async (walletId: string) => {
    try {
      const balance = await custodial_backend.get_balance(id!, walletId);
      const balanceStr = balance.toString();

      setWallets((prevWallets) =>
        prevWallets.map((wallet) =>
          wallet.id === walletId
            ? {
                ...wallet,
                balance: balanceStr,
                balanceLoading: false,
              }
            : wallet
        )
      );
    } catch (error) {
      console.error(`Error fetching balance for wallet ${walletId}:`, error);
      setWallets((prevWallets) =>
        prevWallets.map((wallet) =>
          wallet.id === walletId ? { ...wallet, balanceLoading: false } : wallet
        )
      );
    }
  };

  const fetchWalletDetail = async () => {
    try {
      setIsLoading(true);
      const vaultsResponse = await custodial_backend.get_vault(id!);
      console.log(vaultsResponse);

      setVault({
        blockchain: "eth",
        // @ts-expect-error
        name: vaultsResponse[0].name,
        id: id!,
      });

      console.log({ vaultsResponse });

      const wallets = vaultsResponse[0]?.wallets.map((wallet: any) => ({
        id: wallet[0],
        address: wallet[1].address,
        balance: "0",
        balanceLoading: true,
      }));

      console.log({ wallets });

      const walletsArray = wallets ?? [];

      setWallets(walletsArray);

      // Start loading balances for each wallet
      walletsArray.forEach((wallet) => {
        loadWalletBalance(wallet.id);
      });
    } catch (error) {
      console.error("Error fetching wallet detail:", error);
      api.error({
        message: "Error fetching wallet detail",
        description: "Please try again later.",
        placement: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-left p-16">
      <TransferModal
        visible={transferModalVisible}
        fromWallet={fromWallet}
        setVisible={setTransferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
      ></TransferModal>
      <CreateWalletModal
        vaultId={id!}
        visible={open}
        setVisible={setOpen}
        refreshWallets={fetchWalletDetail}
      />
      <Button
        type="link"
        icon={<LeftOutlined />}
        onClick={() => navigate("/vaults")}
        className="mb-4 text-left"
      >
        Back to Vaults
      </Button>
      <h1 className="text-3xl font-bold">Vault</h1>
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 text-center mr-4 flex flex-col align-middle items-center">
            <WalletFilled className="text-2xl m-auto text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {vault && vault.name}
              {!vault && (
                <div className="animate-pulse h-4 w-[200px] bg-gray-300 rounded"></div>
              )}
            </h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Balance</h3>
          {isLoading ? (
            <p className="animate-pulse h-8 bg-gray-300 w-[100px]"></p>
          ) : (
            <p className="text-4xl font-bold">
              {totalBalance.toLocaleString()} ETH
            </p>
          )}
        </div>
        <div className="mt-8">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Vault" key="1">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-row mt-2 justify-between mr-5">
                  <div className="align-top">
                    <h3 className="text-lg mt-0 font-bold align-top mb-4">
                      Vault Funding
                    </h3>
                    <p className="text-gray-500">0 ETH</p>
                  </div>
                  <div className="align-bottom">
                    <Button type="primary" onClick={() => setOpen(true)}>
                      <PlusOutlined /> Create wallet
                    </Button>
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center mb-4">
                    <div className="animate-pulse w-[32px] h-[32px] bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <p className="animate-pulse h-4 bg-gray-300 w-[300px]"></p>
                      <p className="animate-pulse h-4 bg-gray-300 w-[100px]"></p>
                    </div>
                  </div>
                )}

                {!isLoading &&
                  wallets.map((wallet, index) => (
                    <div key={index} className="flex items-center mt-4 mb-4">
                      {ethLogo}
                      <div className="ml-4">
                        <div
                          className={`transition-opacity ease-in duration-200 ${
                            wallet.address
                              ? "opacity-100 h-auto"
                              : "opacity-0 h-0 overflow-hidden"
                          }`}
                        >
                          <div className="text-gray-500">{wallet.address}</div>
                          {wallet.balanceLoading ? (
                            <>
                              <div className="animate-pulse h-4 bg-gray-300 w-[100px]"></div>
                            </>
                          ) : (
                            <div className="font-semibold">
                              {web3.utils.fromWei(wallet.balance, "ether")} ETH
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                key="transfer"
                                onClick={() => {
                                  setTransferModalVisible(true);
                                  setFromWallet(wallet);
                                }}
                              >
                                Transfer
                              </Menu.Item>
                              <Menu.Item key="execute">Execute</Menu.Item>
                            </Menu>
                          }
                          trigger={["click"]}
                        >
                          <Button>Actions</Button>
                        </Dropdown>
                      </div>
                    </div>
                  ))}
              </div>
            </TabPane>
            {/* Other TabPanes */}
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default VaultDetail;
