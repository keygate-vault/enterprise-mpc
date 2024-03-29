import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Link } from "react-router-dom";
import Password from "antd/es/input/Password";

type SignUpProps = {
  onSignUp: ((values: any) => void) | undefined;
};
const SignUp = ({ onSignUp }: SignUpProps) => {
  return (
    <Form
      initialValues={{ remember: true }}
      onFinish={onSignUp}
      title="Sign up"
      className="w-[400px]"
    >
      <div className="font-semibold mb-5 w-full text-center">Sign up</div>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: "Email is required.",
            type: "email",
          },
        ]}
      >
        <Input
          className="p-2"
          prefix={<MailOutlined className="pr-2" />}
          placeholder="Email"
        />
      </Form.Item>
      <Form.Item
        name="name"
        rules={[
          {
            required: true,
            message: "Name is required.",
            type: "string",
          },
        ]}
      >
        <Input
          className="p-2"
          prefix={<UserOutlined className="pr-2" />}
          placeholder="Name"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Password is required." }]}
      >
        <Password
          className="p-2"
          prefix={<LockOutlined className="pr-2" />}
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please confirm your password.",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Password confirmation does not match.")
              );
            },
          }),
        ]}
      >
        <Input
          className="p-2"
          prefix={<LockOutlined className="pr-2" />}
          type="password"
          placeholder="Confirm password"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full bg-blue-500">
          Sign up
        </Button>
        <div className="mt-2">
          Or{" "}
          <Link to="/sign-in" className="underline">
            sign in!
          </Link>
        </div>
      </Form.Item>
    </Form>
  );
};

export { SignUp };
