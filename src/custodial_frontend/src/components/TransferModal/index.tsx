import { useState } from "react";
import { Modal, Input, Button, message, Form } from "antd";

const TransferModal = ({ fromWallet, visible, onCancel }: any) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onCancel();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Transfer ETH"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="transfer"
          type="primary"
          loading={loading}
          onClick={handleTransfer}
        >
          Transfer
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="fromAddress"
          label={<p className="mb-0">From Address</p>}
        >
          <Input
            placeholder="From Address"
            value={fromWallet?.address}
            disabled
          />
        </Form.Item>
        <Form.Item
          name="toAddress"
          label={<p className="mb-0">Recipient Address</p>}
          rules={[
            { required: true, message: "Please enter the recipient address" },
          ]}
        >
          <Input placeholder="Recipient Address" />
        </Form.Item>
        <Form.Item
          name="amount"
          label={<p className="mb-0">Amount (in ETH)</p>}
          rules={[{ required: true, message: "Please enter the amount" }]}
        >
          <Input placeholder="Amount (in ETH)" type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferModal;
