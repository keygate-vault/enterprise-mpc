"use client";
import { Button, Modal, Typography, Steps } from "antd";
import { useState } from "react";
import { iwallet_backend } from "../../../../../declarations/iwallet_backend";

const { Title, Paragraph } = Typography;
const { Step } = Steps;

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
  const [currentStep, setCurrentStep] = useState(0);

  const handleOk = async () => {
    setLoading(true);
    await iwallet_backend.register();
    setVisible(false);
    setLoading(false);
    refreshWallets();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const steps = [
    {
      title: "Introduction",
      content: (
        <div>
          <Paragraph>
            Welcome to the custodial wallet creation wizard! This wizard will
            guide you through the process of generating a new custodial wallet
            that you can use in your APIs, frontends, and mobile apps.
          </Paragraph>
          <Paragraph>
            Custodial wallets provide a secure and convenient way to manage
            digital assets on behalf of your users. By creating a custodial
            wallet, you can easily integrate blockchain functionality into your
            applications without the need for users to manage their own private
            keys.
          </Paragraph>
        </div>
      ),
    },
    {
      title: "Benefits",
      content: (
        <div>
          <Paragraph>
            Here are some key benefits of using custodial wallets:
          </Paragraph>
          <ul>
            <li>Enhanced security through centralized key management</li>
            <li>
              Simplified user experience for interacting with digital assets
            </li>
            <li>Seamless integration with your existing infrastructure</li>
            <li>Reduced complexity and development effort</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Confirmation",
      content: (
        <div>
          <Paragraph>
            You are now ready to generate your new custodial wallet. Please
            review the following information before proceeding:
          </Paragraph>
          <ul>
            <li>
              The generated wallet will be securely stored and managed by our
              system
            </li>
            <li>
              You will receive an API key and documentation to interact with the
              wallet
            </li>
            <li>
              The wallet's private key will be encrypted and kept confidential
            </li>
          </ul>
          <Paragraph>
            If you agree with the above terms, click "Generate Wallet" to create
            your new custodial wallet.
          </Paragraph>
        </div>
      ),
    },
  ];

  return (
    <Modal
      centered={true}
      title="Wallet Creation"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handlePrev} disabled={currentStep === 0}>
          Previous
        </Button>,
        <Button
          key="next"
          type="primary"
          loading={loading}
          onClick={currentStep === steps.length - 1 ? handleOk : handleNext}
        >
          {currentStep === steps.length - 1 ? "Generate Wallet" : "Next"}
        </Button>,
      ]}
    >
      <Steps current={currentStep} style={{ marginBottom: 15, marginTop: 24 }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <div className="p-8">{steps[currentStep].content}</div>
    </Modal>
  );
}
