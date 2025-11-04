// src/pages/SettingOrganizationPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/SearchBar";
import Header from "../components/Header";
import { ArrowLeft } from "lucide-react";
import { organizations, userCurrentOrganizations } from "../data/DummyData";

export default function SettingOrganizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orgData = location.state?.orgDetail;

  const [name, setName] = useState(orgData?.name || "");
  const [description, setDescription] = useState(orgData?.description || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulasi update organisasi di dummy data
    const orgIndex = organizations.findIndex((o) => o.id === orgData.id);
    if (orgIndex !== -1) {
      organizations[orgIndex].name = name;
      organizations[orgIndex].description = description;
    }

    alert(`✅ Organization "${name}" updated successfully!`);
    navigate("/organization");
  };

  const handleDelete = () => {
    if (confirmText.toLowerCase() === "confirm") {
      // 🔹 Hapus dari organizations
      const orgIndex = organizations.findIndex((o) => o.id === orgData.id);
      if (orgIndex !== -1) organizations.splice(orgIndex, 1);

      // 🔹 Hapus juga dari userCurrentOrganizations
      userCurrentOrganizations.forEach((user) => {
        user.organizations = user.organizations.filter(
          (org) => org.id !== orgData.id
        );
      });

      alert(`❌ Organization "${name}" deleted successfully.`);
      navigate("/home"); // Arahkan ke HomePage.jsx
    } else {
      alert("Please type 'confirm' to proceed with deletion.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Organization" />

        <main className="p-10 flex-1">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] font-medium mb-6 hover:underline"
          >
            <ArrowLeft size={18} />
            Settings
          </button>

          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Organization Name */}
              <div>
                <label className="block text-base font-semibold text-[#23358B] mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  className="bg-white w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#23358B] outline-none text-gray-800 transition-all duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Organization Description */}
              <div>
                <label className="block text-base font-semibold text-[#23358B] mb-2">
                  Organization Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Write a short description about your organization..."
                  className="bg-white w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#23358B] outline-none text-gray-800 resize-none transition-all duration-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2 rounded-md bg-[#FF5C5C] text-white font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-[#133962] text-white font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all duration-200"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md animate-scale-in">
            <h2 className="text-2xl font-bold text-[#23358B] text-center mb-2">
              Delete Organization
            </h2>
            <p className="text-center text-gray-600 text-sm mb-4">
              To permanently delete your organization please type{" "}
              <strong>"confirm"</strong>
              <br />
              <span className="text-red-600 font-semibold">
                Warning: This action is permanent.
              </span>
            </p>

            <input
              type="text"
              placeholder="confirm"
              className="w-full border rounded-md px-3 py-2 mb-6 focus:ring-2 focus:ring-red-500 outline-none transition-all duration-200"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 rounded-md bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-md bg-red-600 text-white font-semibold hover:opacity-90 hover:shadow-md transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
