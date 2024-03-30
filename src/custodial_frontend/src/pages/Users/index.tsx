// Page component for managing users
import { Alert, Button, Card, Modal, notification } from "antd";
import Table, { ColumnProps } from "antd/es/table";
import { useEffect, useState } from "react";
import { CreateUserModal } from "../../components/Users/Create";
import { custodial_backend } from "../../../../declarations/custodial_backend";


type User = {
  id: string;
  label: string;
  role: string;
};

const columns: ColumnProps<User>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Label",
    dataIndex: "label",
    key: "label",
    className: "font-semibold",
  },
  {
    title: "ROLE",
    dataIndex: "role",
    key: "role",
  },
];

const Users = () => {
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [api] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await custodial_backend.get_users();

      const users = response.map((user) => ({
        id: user[1].id,
        label: user[1].email,
        role: user[1].role,
      }));

      setDataSource(users);
    } catch (error) {
      api.error({
        message: "Error fetching users",
        description: "Please try again later.",
        placement: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const onRowClick = (record: User) => {
    // Handle user row click, if needed
  };

  return (
    <main className="flex min-h-screen flex-col items-left p-16">
      <h1 className="text-3xl font-bold">API Keys</h1>
      <div className="flex flex-row justify-between">
        <p className="text-lg">Manage keys and their permissions.</p>
        <Button
          type="primary"
          className="mt-4"
          onClick={() => {
            showModal();
          }}
        >
          New User
        </Button>
      </div>

      <CreateUserModal
        visible={open}
        setVisible={setOpen}
        refreshUsers={() => {
          fetchUsers();
        }}
      />
      <Card className="py-2">
        <Table
          loading={isLoading}
          rowKey="id"
          rowClassName="cursor-pointer py-4"
          dataSource={dataSource}
          showHeader={true}
          columns={columns}
          pagination={false}
          onRow={(record) => ({
            onClick: () => onRowClick(record),
          })}
        />
      </Card>
    </main>
  );
};

export default Users;
