// src/App.jsx
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForgotPasswordSuccess from "./pages/ForgotPasswordSuccess";
import DashboardPage from "./pages/DashboardPage";
import AccountDetailPage from "./pages/AccountDetailPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

import "./styles.css"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/forgot/success" element={<ForgotPasswordSuccess />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/account" element={<AccountDetailPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
    </Routes>
  );
}
