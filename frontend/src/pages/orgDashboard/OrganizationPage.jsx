// src/pages/OrganizationPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/SideBar.jsx";
import Header from "../../components/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { XCircle } from "lucide-react";

export default function OrganizationPage() {
  const { id } = useParams();
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [org, setOrg] = useState("");

  const userId = user ? user.id || user._id : null;
  const isCreator =
    user && org && String(userId) === String(org.createdBy?._id);

  // popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "error",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showNotification = (type, title, message, onConfirm = null) => {
    setPopupConfig({ type, title, message, onConfirm });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupConfig.onConfirm) {
      setTimeout(() => {
        popupConfig.onConfirm();
      }, 100);
    }
  };

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoadingData(true);

        console.log("🔍 Fetching organization:", id);
        console.log("👤 Current user:", user);

        const userId = user.id || user._id;

        const res = await fetch(
          `http://localhost:8080/api/organization/${id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        console.log("📦 Organization data:", data);

        if (!res.ok) {
          throw new Error(`Failed to fetch organization data: ${data.message}`);
        }

        const isCreator = String(data.createdBy._id) === String(userId);
        const isMember = data.members.some(
          (m) => String(m.user._id) === String(userId)
        );

        console.log("✅ Is Creator:", isCreator);
        console.log("✅ Is Member:", isMember);
        console.log(
          "📋 Members list:",
          data.members.map((m) => m.user._id)
        );
        console.log("🆔 User ID:", userId);

        if (!isCreator && !isMember) {
          // alert("You are not authorized to access this organization");
          // navigate("/home/current");
          showNotification(
            "error",
            "Access Denied",
            "You are not authorized to access this organization.",
            () => navigate("/home/current")
          );
          return;
        }

        setOrg(data);
      } catch (err) {
        console.error("Error fetching organization data: ", err);
        // navigate("/home/current");
        showNotification(
          "error",
          "Failed to Load Organization",
          err.message || "Unable to load organization data. Please try again."
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchOrg();
  }, [id, user, loading, navigate]);

  const handleLeave = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/organization/${id}/leave`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        // alert(`✅ Successfully left the organization`);
        // navigate("/home/current");
        showNotification(
          "success",
          "Left Organization",
          "You have successfully left the organization.",
          () => navigate("/home/current")
        );
      } else {
        const errorMsg =
          data.error || data.message || "Failed to delete organization";
        // alert(`❌ ${errorMsg}`);
        showNotification("error", "Failed to Leave", errorMsg);
      }
    } catch (err) {
      console.error("Error deleting organization:", err);
      // alert("❌ An error occurred while leaving the organization");
      showNotification(
        "error",
        "Server Error",
        "An error occurred while leaving the organization. Please try again."
      );
    }
  };

  // // Ambil user aktif dari localStorage
  // const currentUser =
  //   JSON.parse(localStorage.getItem("currentUser")) ||
  //   users.find((u) => u.id === 1);

  // // Ambil organisasi user dari dummy data
  // const userData = userCurrentOrganizations.find(
  //   (u) => u.userId === currentUser.id
  // );

  // if (!userData || userData.organizations.length === 0) {
  //   return (
  //     <div className="flex min-h-screen bg-gray-50">
  //       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  //       <div
  //         className={`flex-1 flex flex-col transition-all duration-300 ${
  //           sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
  //         }`}
  //       >
  //         <Header title="Organization" toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
  //         <div className="flex flex-1 justify-center items-center text-gray-600">
  //           <p>You are not currently part of any organization.</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // const activeOrg =
  //   userData.organizations.find((org) => org.status === "active") ||
  //   userData.organizations[0];

  // const orgDetail = organizations.find((o) => o.id === activeOrg.id);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23358B] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          orgId={id}
        />

        {/* Main content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
          }`}
        >
          <Header
            title="Organization"
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="p-6 md:p-10 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
              {/* Organization Name */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                  Organization Name
                </h3>
                <p className="text-gray-900 font-medium uppercase">
                  {org?.name}
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                  Organization Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {org?.description ||
                    "No description available for this organization."}
                </p>
              </div>

              {/* Author */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                  Author Organization
                </h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {org?.createdBy?.username || "Unknown"}
                </p>
              </div>

              {/* Date Created */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#23358B] mb-1">
                  Date Created
                </h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {org?.createdAt
                    ? new Date(org.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>

              {/* Button Settings */}
              {!isCreator && (
                <div className="flex justify-start">
                  <button
                    onClick={handleLeave}
                    className="px-6 py-2 bg-[#E84545] text-white rounded-md font-semibold hover:opacity-90 transition"
                  >
                    Leave Organization
                  </button>
                </div>
              )}

              {/* Button Settings */}
              {isCreator && (
                <div className="flex justify-start">
                  <button
                    onClick={() =>
                      //navigate(`/${org._id}/organization/settings`, { state: { orgDetail } })
                      navigate(`/${org._id}/organization/settings`, {
                        state: { organization: org },
                      })
                    }
                    className="px-6 py-2 bg-[#133962] text-white rounded-md font-semibold hover:opacity-90 transition"
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <XCircle className="w-16 h-16 text-red-500 mb-4" />

              {/* Title */}
              <h2 className="text-xl font-bold text-[#23358B] mb-2">
                {popupConfig.title}
              </h2>

              {/* Message */}
              <p className="text-gray-700 mb-6">{popupConfig.message}</p>

              {/* Button */}
              <button
                onClick={closePopup}
                className="px-8 py-2 rounded-md text-white font-semibold transition-all bg-red-600 hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
