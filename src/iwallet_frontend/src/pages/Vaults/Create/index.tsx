"use client";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import { useState } from "react";
import { iwallet_backend } from "../../../../../declarations/iwallet_backend";

export default function CreateVaultModal({
  visible,
  setVisible,
  refreshVaults,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refreshVaults: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await iwallet_backend.createVault(values.name);
      setVisible(false);
      refreshVaults();
    } catch (error) {
      console.error("Error creating vault:", error);
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
      title="Create a vault"
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
          name="name"
          label={<p style={{ fontSize: "16px" }}>Vault name</p>}
          rules={[{ required: true, message: "Please enter an account name" }]}
        >
          <Input placeholder="e.g. Funding" className="p-5" />
        </Form.Item>
        {/* <Form.Item name="autoFuel" valuePropName="checked"> */}
        {/* consider later: <Checkbox>Auto-fuel using the designated Gas Station vault.</Checkbox> */}
        {/* </Form.Item> */}
      </Form>
    </Modal>
  );
}
