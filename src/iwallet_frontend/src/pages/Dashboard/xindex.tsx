import { Button, Modal, notification } from "antd";
import Table, { ColumnProps } from "antd/es/table";
import { useEffect, useState } from "react";
import { iwallet_backend } from "../../../../declarations/iwallet_backend";
import CreateWalletModal from "../Wallets/Create";
import { useNavigate, useParams } from "react-router-dom";

type Wallet = {
  id: string;
  publicKey: string;
};

const columns: ColumnProps<Wallet>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "PUBLIC KEY",
    dataIndex: "publicKey",
    key: "publicKey",
  },
];

const Dashboard = () => {
  const [dataSource, setDataSource] = useState<Wallet[]>([]);
  const [api] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const response = await iwallet_backend.getAll();
      setIsLoading(false);
      if (response) {
        console.log("response", response);
        const wallets = response.map((wallet) => ({
          id: wallet.id.toText(),
          publicKey: wallet.publicKey,
        }));

        setDataSource(wallets);
      } else {
        api.error({
          message: "Failed to fetch wallets",
          description: "Please try again later.",
          placement: "bottom",
        });
      }
    } catch (error) {
      api.error({
        message: "Error fetching wallets",
        description: "Please try again later.",
        placement: "bottom",
      });
    }
  };

  const onRowClick = (record: Wallet) => {
    navigate(`/wallets/${record.id}`);
  };

  const showModal = () => {
    setOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-left p-16">
      <h1 className="text-3xl font-bold">Wallets</h1>
      <div className="flex flex-row justify-between">
        <p className="text-lg">
          Create and view custodial wallets for your users.
        </p>
        <Button
          type="primary"
          className="mt-4"
          onClick={() => {
            showModal();
          }}
        >
          New wallet
        </Button>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        rowClassName="cursor-pointer"
        dataSource={dataSource}
        columns={columns}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
        })}
      />
    </main>
  );
};

export default Dashboard;
