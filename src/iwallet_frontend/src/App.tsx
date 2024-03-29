import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { ConfigProvider } from "antd";
import WalletDetail from "./pages/Wallets/View";
import VaultDetail from "./pages/Vaults/View";
import PageLayout from "./PageLayout";

function App() {
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
              <Route element={<PageLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vaults/:id" element={<VaultDetail />} />
                <Route path="/vaults/" element={<Dashboard />} />
                <Route path="/wallets/:email" element={<WalletDetail />} />
              </Route>
            </Routes>
          </div>
        </main>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
