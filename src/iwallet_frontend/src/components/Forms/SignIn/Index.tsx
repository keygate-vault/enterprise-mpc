import React from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import {Link} from "react-router-dom";

type SignInProps = {
  onSignIn: ((values: any) => void) | undefined
}
const SignIn = ({onSignIn}: SignInProps) => {
  return (
    <Form
      initialValues={{ remember: true }}
      onFinish={onSignIn}
      title="Sign in"
    >
      <div className="font-semibold mb-5 w-full text-center">Sign in</div>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: "Please input your Email!",
            type: "email",
          },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your Password!" }]}
      >
        <Input
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full bg-blue-500">
          Sign in
        </Button>
        <div className="mt-2">
          Or{" "}
          <Link to="/sign-up" className="underline">
            register now!
          </Link>
        </div>
      </Form.Item>
    </Form>
  );
};

export { SignIn };
