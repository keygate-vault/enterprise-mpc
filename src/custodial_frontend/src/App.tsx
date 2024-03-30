import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLayout from "./PageLayout";
import Dashboard from "./pages/Dashboard";
import VaultDetail from "./pages/Vaults/View";
import Users from "./pages/Users";
import React from "react";
import useAuthGuard from "./hooks/useAuthGuard";
import SignIn from "./pages/Auth/SignIn";
import Landing from "./pages/Landing";

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
              <Route path="/" element={<Landing />} />
              <Route path="/sign-in/" element={<SignIn />} />
              <Route element={<PageLayout />}>
                <Route path="/vaults" element={<Dashboard />} />
                <Route path="/vaults/:id" element={<VaultDetail />} />
                <Route path="/vaults/" element={<Dashboard />} />
                <Route path="/users/" element={<Users />} />
              </Route>
            </Routes>
          </div>
        </main>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
