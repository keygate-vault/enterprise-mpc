import {Outlet, useLocation, useNavigate} from "react-router-dom";
import { Button, Dropdown, Layout, Menu, Modal } from "antd";
import {
  WalletOutlined,
  CodeOutlined,
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import useIdentity from "./hooks/useIdentity";
import { useCallback, useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import UserProfileModal from "./components/UserProfileModal";
import { User } from "../../declarations/custodial_backend/custodial_backend.did";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    actor,
    identity,
    initIdentity,
    isAuthenticated,
    isAuthClientInitialized,
    login,
  } = useIdentity();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userProfileModalVisible, setUserProfileModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const getSelectedKey = (path?: string): string => {
    if (path === "/") return "1";
    if (path === "/developers") return "2";
    if (path === "/users") return "3";

    return "1";
  };

  const handleDropdownClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleMenuClick = (e: any) => {
    if (e.key === "profile") {
      setUserProfileModalVisible(true);
    } else if (e.key === "logout") {
      // logout();
    }
    setDropdownVisible(false);
  };

  const dropdownMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        View Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const initialize = async () => {
    if (!isAuthClientInitialized()) {
      console.log("Initializing identity");
      await initIdentity();
    }
  };

  const setUserDetails = async () => {
    console.log("Getting user details");
    const id = await actor?.whoami();
    console.log("ID", id);
    const userId = id ? id.toText() : null;
    console.log("USER ID", userId);
    const userFetch = await actor?.get_user(userId!);
    console.log("USER FETCH", userFetch);
    const user =
      userFetch && userFetch.length > 0
        ? {
            id: userFetch[0]!.id,
            username: userFetch[0]!.username,
            role: userFetch[0]!.role,
            status: userFetch[0]!.status,
          }
        : null;

    console.log("USER", user);
    setUser(user);
  };

  useEffect(() => {
    if (actor) {
      setUserDetails();
    }
  }, [actor]);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
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
          <div className="mt-8 mb-2 w-full items-center flex flex-col rounded-full">
            <Dropdown
              overlay={dropdownMenu}
              visible={dropdownVisible}
              onVisibleChange={handleDropdownClick}
            >
              <UserOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
            </Dropdown>
            <span className="mt-2 text-sm">
              {user ? user.username : "Loading..."}
            </span>
          </div>

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
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <Modal
        centered
        visible={!isAuthenticated() && isAuthClientInitialized()}
        footer={null}
      >
        {/* Your authentication modal content */}
        <p>Please login to continue.</p>
        <Button onClick={login}>Login</Button>
      </Modal>
      <UserProfileModal
        visible={userProfileModalVisible}
        setVisible={setUserProfileModalVisible}
      />
    </>
  );
}