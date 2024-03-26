import { Button, Modal, notification } from "antd";
import Table, { ColumnProps } from "antd/es/table";
import { useEffect, useState } from "react";
import { iwallet_backend } from "../../../../declarations/iwallet_backend";
import CreateWalletModal from "../Wallets/Create";
import { useNavigate, useParams } from "react-router-dom";

type User = {
  name: string;
  email: string;
  publicKey: string;
};

const columns: ColumnProps<User>[] = [
  {
    title: "NAME",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "EMAIL",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "PUBLIC KEY",
    dataIndex: "publicKey",
    key: "publicKey",
  },
];

const Dashboard = () => {
  const [dataSource, setDataSource] = useState<User[]>([]);
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
        setDataSource(response);
      } else {
        api.error({
          message: "Failed to fetch collections",
          description: "Please try again later.",
          placement: "bottom",
        });
      }
    } catch (error) {
      api.error({
        message: "Error fetching collections",
        description: "Please try again later.",
        placement: "bottom",
      });
    }
  };

  const onRowClick = (record: User) => {
    navigate(`/wallets/${record.email}`);
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
      <CreateWalletModal
        visible={open}
        setVisible={setOpen}
        refreshWallets={() => {
          fetchWallets();
        }}
      />
      <Table
        loading={isLoading}
        rowKey={"email"}
        rowClassName={"cursor-pointer"}
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
