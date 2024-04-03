import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Progress, notification } from "antd";
import useIdentity from "../../hooks/useIdentity";
import { useNavigate } from "react-router-dom";

const Onramp = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { actor, login, initIdentity } = useIdentity();
  const navigate = useNavigate();
  const [api] = notification.useNotification();
  const { isAuthenticated, isAuthReady } = useIdentity();
  const [userFound, setUserFound] = useState(false);

  useEffect(() => {
    initIdentity();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated() && isAuthReady()) {
        try {
          const id = await actor?.whoami();
          const userId = id ? id.toText() : null;
          const userFetch = await actor?.get_user(userId!);

          if (userFetch && userFetch.length > 0) {
            setUserFound(true);
          } else {
            setUserFound(false);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setUserFound(false);
        }
      }
    };

    fetchUserDetails();
  }, [actor]);

  useEffect(() => {
    if (isAuthenticated() && isAuthReady() && userFound) {
      navigate("/vaults");
    }
  }, [userFound]);

  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
    setLoading(true);

    try {
      if (!isAuthenticated()) {
        console.log("Not authenticated");
        await login();
        console.log("logged in");
      }

      if (!userFound) {
        const username = values.username;
        const role = "user"; // Set the default role as "user"

        // Call the create_user function from the backend canister
        const user = await actor!.create_user(username, role);
        console.log("User created:", user);
      }

      navigate("/vaults");
    } catch (error) {
      console.error("Setup error:", error);
      api.error({
        message: "Error creating user",
        description: "Please try again later.",
        placement: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestModalOk = () => {
    setRequestSent(false);
    // navigate("/");
  };

  return (
    <div>
      <Modal
        visible={visible}
        title={<div>Platform setup</div>}
        footer={null}
        closable={true}
        centered
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        {userFound ? (
          <div>
            <p>Welcome back!</p>
            <Button className="mt-2" onClick={handleSubmit} loading={loading}>
              Login
            </Button>
          </div>
        ) : (
          <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please enter a username" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button
                className="mt-2"
                htmlType="submit"
                block
                loading={loading}
              >
                Request access
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        visible={requestSent}
        title="Request Sent"
        onOk={handleRequestModalOk}
        closable={false}
        centered
      >
        <p>
          Your request has been sent. Please contact the administrators to
          approve your request.
        </p>
      </Modal>
    </div>
  );
};

export default Onramp;
