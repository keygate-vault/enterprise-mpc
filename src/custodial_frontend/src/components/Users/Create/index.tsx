import {Button, Form, Input, Modal, Select} from "antd";
import { useState } from "react";
import { custodial_backend } from "../../../../../declarations/custodial_backend";

const CreateUserModal = ({
    visible,
    setVisible,
    refreshUsers,
  }: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refreshUsers: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await custodial_backend.create_user(values.email, values.role);
      setVisible(false);
      refreshUsers();
      form.resetFields();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      centered
      title="Create a user"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          Create
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label={<p className="mb-0" style={{ fontSize: "16px" }}>Email</p>}
          rules={[{ required: true, type: "email", message: "Please enter an email" }]}
        >
          <Input size="large" placeholder="e.g. example@example.com" />
        </Form.Item>
        <Form.Item
          name="role"
          label={<p className="my-0" style={{ fontSize: "16px" }}>Role</p>}
          rules={[{ required: true, message: "Please enter a role" }]}
        >
          <Select placeholder="Select a role" size="large">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { CreateUserModal }
