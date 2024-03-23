import { Button } from "antd";
import Table, { ColumnProps } from "antd/es/table";

type User = {
  name: string;
  email: string;
  publicKey: string;
};

const dataSource = [
  {
    name: "John Doe",
    email: "thevincentes@gmail.com",
    publicKey: "0x1234567890abcdef",
  },
  {
    name: "Maria Nociella",
    email: "bzer@gmail.com",
    publicKey: "0xabcdef1234567890",
  },
  {
    name: "Juan Sanseviero",
    email: "jsansev@gmail.com",
    publicKey: "0xabcdef123456789032",
  },
];

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
  return (
    <main className="flex min-h-screen flex-col items-left p-16">
      <h1 className="text-3xl font-bold">Wallets</h1>
      <div className="flex flex-row justify-between">
        <p className="text-lg">
          Create and view custodial wallets for your users.
        </p>
        <Button type="primary" className="mt-4">
          New wallet
        </Button>
      </div>
      <Table dataSource={dataSource} columns={columns} />
    </main>
  );
};

export default Dashboard;
