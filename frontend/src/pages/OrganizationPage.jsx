// src/pages/OrganizationPage.jsx
import React, { useState } from "react";
import Sidebar from "../components/SideBar"
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
  users,
  organizations,
  userCurrentOrganizations,
} from "../data/DummyData";

export default function OrganizationPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil user aktif dari localStorage
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    users.find((u) => u.id === 1);

  // Ambil organisasi user dari dummy data
  const userData = userCurrentOrganizations.find(
    (u) => u.userId === currentUser.id
  );

  if (!userData || userData.organizations.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
          }`}
        >
          <Header title="Organization" toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex flex-1 justify-center items-center text-gray-600">
            <p>You are not currently part of any organization.</p>
          </div>
        </div>
      </div>
    );
  }

  const activeOrg =
    userData.organizations.find((org) => org.status === "active") ||
    userData.organizations[0];

  const orgDetail = organizations.find((o) => o.id === activeOrg.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
        }`}
      >
        <Header title="Organization" toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-6 md:p-10 w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
            {/* Organization Name */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                Organization Name
              </h3>
              <p className="text-gray-900 font-medium uppercase">
                {orgDetail.name}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                Organization Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {orgDetail.description ||
                  "No description available for this organization."}
              </p>
            </div>

            {/* Button */}
            <div className="flex justify-start">
              <button
                onClick={() =>
                  navigate("/organization/settings", { state: { orgDetail } })
                }
                className="px-6 py-2 bg-[#133962] text-white rounded-md font-semibold hover:opacity-90 transition"
              >
                Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

