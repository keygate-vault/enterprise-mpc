"use client";

import { Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import { iwallet_backend } from "../../../../../declarations/iwallet_backend";

export default function CreateWallet() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen min-w-screen flex-col items-left">
      <div className="p-16 ">
        <h1 className="text-3xl font-bold">Detail the wallet's information</h1>
        <p className="text-lg">
          Create a new custodial wallet for your organization.
        </p>
        <div className="">
          <Form
            initialValues={{ remember: true }}
            title="Create wallet"
            className="w-[800px]"
            onFinish={async (values) => {
              console.log("onSignUp", values);
              const result = await iwallet_backend.register(
                values.email,
                values.name
              );
              // go to dashboard
              navigate("/");
              console.log("onSignUp result", result);
            }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Name is required.",
                  type: "string",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Email is required.",
                  type: "email",
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-500"
              >
                Create
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </main>
  );
}
