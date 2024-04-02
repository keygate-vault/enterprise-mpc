import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Progress, notification } from "antd";
import useIdentity from "../../hooks/useIdentity";
import { useNavigate } from "react-router-dom";
import { custodial_backend } from "../../../../declarations/custodial_backend";

const Onramp = () => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { actor, login, initIdentity } = useIdentity();
  const navigate = useNavigate();
  const [api] = notification.useNotification();

  useEffect(() => {
    initIdentity();
  }, []);

  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
    await login();
    setLoading(true);
    try {
      const username = values.username;
      const role = "user"; // Set the default role as "user"

      // Call the create_user function from the backend canister
      const user = await custodial_backend.create_user(username, role);
      console.log("User created:", user);

      console.log("User created:", user);
      setVisible(false);
      setRequestSent(true);
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
    navigate("/");
  };

  return (
    <div>
      <Modal
        visible={visible}
        title={<div>Platform setup</div>}
        footer={null}
        closable={false}
        centered
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input className="p-2" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Request access
            </Button>
          </Form.Item>
        </Form>
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
