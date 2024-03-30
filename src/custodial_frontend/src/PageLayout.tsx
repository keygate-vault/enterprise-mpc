import {Outlet, useLocation, useNavigate} from "react-router-dom";
import { Layout, Menu } from "antd";
import { WalletOutlined, CodeOutlined, UserOutlined } from "@ant-design/icons";
import useAuthGuard from "./hooks/useAuthGuard";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  useAuthGuard();

  const getSelectedKey = (path?: string): string => {
    if (path === "/") return "1";
    if (path === "/developers") return "2";
    if (path === "/users") return "3";

    return "1";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
        }}
      >
        <div
          className="logo"
          style={{
            height: "32px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.3)",
          }}
        />
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[getSelectedKey(location.pathname)]}
        >
          <Menu.Item
            key="1"
            icon={<WalletOutlined />}
            onClick={() => navigate("/vaults")}
          >
            Vaults
          </Menu.Item>
          <Menu.Item key="2" icon={<CodeOutlined />}>
            Developers
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<UserOutlined />}
            onClick={() => navigate("/users")}
          >
            Users
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "50px 50px 50px 240px" }}>
          <div>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
