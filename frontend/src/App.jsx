// src/App.jsx
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForgotPasswordSuccess from "./pages/ForgotPasswordSuccess";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AccountDetailPage from "./pages/AccountDetailPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ManageDocs from './pages/ManageDocs';
import ViewDoc from './pages/ViewDoc.jsx';
import AddDoc from './pages/AddDoc.jsx';
import CurrentOrganizationsPage from "./pages/CurrentOrganizationPage.jsx";
import CreateOrganizationPage from "./pages/CreateOrganizationPage.jsx";
import JoinOrganizationPage from "./pages/JoinOrganizationPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/forgot/success" element={<ForgotPasswordSuccess />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/home/join" element={<JoinOrganizationPage />} />
      <Route path="/home/current" element={<CurrentOrganizationsPage />} />
      <Route path="/home/new" element={<CreateOrganizationPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/account" element={<AccountDetailPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
      <Route path="/manage-document" element={<ManageDocs />} />
      <Route path="/viewdoc" element={<ViewDoc />} />
      <Route path="/manage-document/:id" element={<ViewDoc />} />
      <Route path="/manage-document/add" element={<AddDoc />} />
    </Routes>
  );
}
