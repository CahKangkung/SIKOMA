// src/App.jsx
import { Routes, Route } from "react-router-dom";

import { UserProvider } from "./context/UserContext.jsx";

// Account Page
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForgotPasswordSuccess from "./pages/ForgotPasswordSuccess";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

// User Page
import HomePage from "./pages/userDashboard/HomePage.jsx";
import AuthRoute from "./components/AuthRoute.jsx";
import AccountDetailPage from "./pages/AccountDetailPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import CurrentOrganizationsPage from "./pages/userDashboard/CurrentOrganizationPage.jsx";
import CreateOrganizationPage from "./pages/userDashboard/CreateOrganizationPage.jsx";
import JoinOrganizationPage from "./pages/userDashboard/JoinOrganizationPage.jsx";

// Organization Page
import DashboardPage from "./pages/orgDashboard/DashboardPage.jsx";
import MemberPage from "./pages/orgDashboard/MemberPage.jsx";
import OrganizationPage from "./pages/orgDashboard/OrganizationPage.jsx";
import SettingOrganizationPage from "./pages/orgDashboard/SettingOrganizationPage.jsx";
import ManageDocs from './pages/orgDashboard/ManageDocs.jsx';
import ViewDoc from './pages/orgDashboard/ViewDoc.jsx';
import AddDoc from './pages/orgDashboard/AddDoc.jsx';


export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/forgot/success" element={<ForgotPasswordSuccess />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/home" element={
          <AuthRoute>
            <HomePage />
          </AuthRoute>
        }/>
        <Route path="/home/join" element={<JoinOrganizationPage />} />
        <Route path="/home/current" element={<CurrentOrganizationsPage />} />
        <Route path="/home/new" element={<CreateOrganizationPage />} />
        <Route path="/:id/dashboard" element={<DashboardPage />} />
        <Route path="/:id/member" element={<MemberPage />} />
        <Route path="/:id/organization" element={<OrganizationPage />} />
        <Route path="/:id/organization/settings" element={<SettingOrganizationPage />} />
        <Route path="/account" element={<AccountDetailPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
        <Route path="/:id/manage-document" element={<ManageDocs />} />
        <Route path="/viewdoc" element={<ViewDoc />} />
        <Route path="/:id/manage-document/:id" element={<ViewDoc />} />
        <Route path="/:id/manage-document/add" element={<AddDoc />} />
      </Routes>
    </UserProvider>
  );
}
