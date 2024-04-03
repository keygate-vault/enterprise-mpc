import React, { useState } from "react";

import { Modal, Input, Button, message } from "antd";

import Web3 from "web3";
import FormItemLabel from "antd/es/form/FormItemLabel";

const TransferModal = ({ fromWallet, visible, onCancel }: any) => {
  const [toAddress, setToAddress] = useState("");

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);

    try {
      const web3 = new Web3(Web3.givenProvider);

      const accounts = await web3.eth.getAccounts();

      if (accounts[0] !== fromWallet.address) {
        throw new Error("Sender address does not match the connected account.");
      }

      const value = web3.utils.toWei(amount, "ether");

      await web3.eth.sendTransaction({
        from: fromWallet.address,

        to: toAddress,

        value: value,
      });

      message.success("Transfer successful");

      onCancel();
    } catch (err: any) {
      message.error(err.message);
    }

    setLoading(false);
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
      <div className="space-y-5">
        <Input
          placeholder="From Address"
          value={fromWallet?.address}
          disabled
        />

        <Input
          placeholder="Recipient Address"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />

        <Input
          placeholder="Amount (in ETH)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default TransferModal;
