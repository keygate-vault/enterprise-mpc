// Page component for managing users
import { Alert, Button, Card, Modal, notification } from "antd";
import Table, { ColumnProps } from "antd/es/table";
import { useEffect, useState } from "react";
import { CreateUserModal } from "../../components/Users/Create";
import { custodial_backend } from "../../../../declarations/custodial_backend";
import { CheckCircleOutlined } from "@ant-design/icons";

type User = {
  id: string;
  username: string;
  role: string;
  status: string;
};

const Users = () => {
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const columns: ColumnProps<User>[] = [
    {
      title: "USERNAME",
      dataIndex: "username",
      key: "username",
      width: 200,
      render: (username) => <p className="text-sm">{username}</p>,
    },
    {
      title: "ROLE",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => {
        let color;
        switch (role) {
          case "admin":
            color = "red";
            break;
          case "manager":
            color = "orange";
            break;
          case "user":
            color = "green";
            break;
          default:
            color = "blue";
        }
        return (
          <Alert
            message={role}
            showIcon
            className="text-sm capitalize text-center"
          />
        );
      },
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Alert
          message={status === "active" ? "Active" : "Inactive"}
          type={status === "active" ? "success" : "error"}
          showIcon
        />
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (text, record) => (
        <Button
          type={record.status === "active" ? "default" : "primary"}
          shape="round"
          size="small"
          onClick={() => activateUser(record.id)}
          disabled={record.status === "active"}
          icon={<CheckCircleOutlined />}
          style={{
            backgroundColor: record.status === "active" ? "#e6f7ff" : "#1890ff",
            color: record.status === "active" ? "#1890ff" : "#fff",
            borderColor: "#1890ff",
          }}
        >
          {record.status === "active" ? "Activated" : "Activate"}
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const activateUser = async (userId: string) => {
    try {
      console.log("Activating user", userId);
      await custodial_backend.set_user_status(userId, "active");
      api.success({
        message: "User activated",
        description: "The user status has been set to active.",
        placement: "bottom",
      });
      fetchUsers(); // Refresh the user list after activation
    } catch (error) {
      api.error({
        message: "Error activating user",
        description: "Please try again later.",
        placement: "bottom",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await custodial_backend.get_users();
      const users = response.map((user) => ({
        id: user[1].id,
        username: user[1].username,
        role: user[1].role,
        status: user[1].status,
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
      {contextHolder}
      <h1 className="text-3xl font-bold">Users</h1>
      <div className="flex flex-row justify-between">
        <p className="text-lg">Manage users and their permissions.</p>
        <Button
          type="primary"
          className="mt-4"
          disabled={true}
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
