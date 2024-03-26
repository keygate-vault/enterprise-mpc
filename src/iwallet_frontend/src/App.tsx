import { BrowserRouter, Routes, Route } from "react-router-dom";
import { iwallet_backend } from "../../declarations/iwallet_backend";
import { SignIn } from "./components/Forms/SignIn/Index";
import { SignUp } from "./components/Forms/SignUp/Index";
import Dashboard from "./pages/Dashboard";
import { ConfigProvider } from "antd";
import CreateWallet from "./pages/Wallets/Create";
import WalletDetail from "./pages/Wallets/View";

function App() {
  const onSignIn = (values: any) => {
    console.log("onSignIn", values);
  };

  const onSignUp = async (values: any) => {
    console.log("onSignUp", values);
    const result = await iwallet_backend.register(values.email, values.name);
    console.log("onSignUp result", result);
  };

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "Inter, sans-serif",
          },
          components: {
            Table: {
              fontSize: 12,
            },
          },
        }}
      >
        <main
          className="h-full bg-gradient-to-b from-[#F9FAFA] to-[#EBF0F1]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <div className="w-screen h-full">
            <Routes>
              <Route
                path="/sign-in"
                element={
                  <div className="flex items-center justify-center h-full">
                    <SignIn onSignIn={onSignIn} />
                  </div>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <div className="flex items-center justify-center h-full">
                    <SignUp onSignUp={onSignUp} />
                  </div>
                }
              />
              <Route path="/" element={<Dashboard />} />
              <Route path="/wallets/:email" element={<WalletDetail />} />
            </Routes>
          </div>
        </main>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
