"use client";

import { Form, Input, Modal } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { iwallet_backend } from "../../../../../declarations/iwallet_backend";

export default function CreateWalletModal({
  visible,
  setVisible,
  refreshWallets,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refreshWallets: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const form = Form.useForm();

  const handleOk = async () => {
    setLoading(true);
    const values = form.at(0)?.getFieldsValue();
    const result = await iwallet_backend.register(values.email, values.name);
    setVisible(false);
    setLoading(false);
    refreshWallets();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      centered={true}
      title="Create new wallet"
      open={visible}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <main className="flex flex-col items-left">
        <div className="p-8">
          <Form
            initialValues={{ remember: true }}
            title="Create wallet"
            requiredMark={false}
            form={form.at(0)}
          >
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "",
                  type: "string",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="John Stewart" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "",
                  type: "email",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="jstewart@busiwax.com"
              />
            </Form.Item>
          </Form>
        </div>
      </main>
    </Modal>
  );
}
