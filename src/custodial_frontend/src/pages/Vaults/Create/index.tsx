"use client";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { custodial_backend } from "../../../../../declarations/custodial_backend";

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
      await custodial_backend.create_vault(values.name);
      setVisible(false);
      refreshVaults();
      form.resetFields()
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
          label={
            <p className="mb-0" style={{ fontSize: "16px" }}>
              Vault name
            </p>
          }
          rules={[{ required: true, message: "Please enter an account name" }]}
        >
          <Input className="p-5" placeholder="e.g. Funding" />
        </Form.Item>
        {/* <Form.Item name="autoFuel" valuePropName="checked"> */}
        {/* consider later: <Checkbox>Auto-fuel using the designated Gas Station vault.</Checkbox> */}
        {/* </Form.Item> */}
      </Form>
    </Modal>
  );
}
