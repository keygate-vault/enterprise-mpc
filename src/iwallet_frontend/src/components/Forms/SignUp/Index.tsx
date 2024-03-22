import React from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';

type SignUpProps = {
  onSignUp: ((values: any) => void) | undefined
}
const SignUp = ({onSignUp}: SignUpProps) => {
  return (
    <Form
      initialValues={{ remember: true }}
      onFinish={onSignUp}
    >
      <Form.Item
        name="email"
        rules={[{ required: true, message: 'Please input your Email!', type: "email" }]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
      >
        <Input
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new password that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input
          prefix={<LockOutlined />}
          type="password"
          placeholder="Confirm Password"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full bg-blue-500">
          Sign up
        </Button>
        Or <a className="underline" href="">sign in!</a>
      </Form.Item>
    </Form>
  );
};

export { SignUp };
