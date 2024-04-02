import React from "react";
import { Modal, Form, Input, Button } from "antd";

const UserProfileModal = ({ visible, onCancel, setVisible, id }: any) => {
  // You can hard code the name and email for now, or fetch them using the provided id
  const name = "John Doe";
  const email = "john.doe@example.com";

  return (
    <Modal
      title="User Profile"
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={null}
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={name} disabled />
        </Form.Item>
        <Form.Item label="Email">
          <Input value={email} disabled />
        </Form.Item>
        <Form.Item>
          <Button type="primary">Save</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;
