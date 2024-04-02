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
      await custodial_backend.create_user(values.username, values.role);
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
      <Form
        form={form}
        className="flex flex-col"
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          label={<p className="mb-0">Username</p>}
          rules={[{ required: true, message: "Please enter a username" }]}
        >
          <Input placeholder="e.g johnstewart" />
        </Form.Item>
        <Form.Item
          name="role"
          label={<p className="my-0">Role</p>}
          rules={[{ required: true, message: "Please enter a role" }]}
        >
          <Select
            placeholder="Select a role"
            dropdownStyle={{
              padding: "10px",
            }}
          >
            <Select.Option value="admin">Administrator</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { CreateUserModal }
