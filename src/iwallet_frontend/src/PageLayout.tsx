import { Outlet } from "react-router-dom";
import { Layout, Menu } from "antd";
import { WalletOutlined, CodeOutlined, UserOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="light">
        <div
          className="logo"
          style={{
            height: "32px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.3)",
          }}
        />
        <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<WalletOutlined />}>
            Vaults
          </Menu.Item>
          <Menu.Item key="2" icon={<CodeOutlined />}>
            Developers
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            Users
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "50px" }}>
          <div>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
