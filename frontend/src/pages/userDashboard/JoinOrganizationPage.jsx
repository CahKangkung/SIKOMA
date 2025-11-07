// src/pages/userDashboard/JoinOrganizationPage.jsx 
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
// import { organizations } from "../../data/DummyData" 

export default function JoinOrganizationPage() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submited, setSubmited] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error" | "warning"
    title: "",
    message: "",
    onConfirm: null
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
    const fetchAvailableOrgs = async () => {
      try {
        setLoadingOrgs(true);
        const res = await fetch("http://localhost:8080/api/organization/available", {
          credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
          setOrgs(data);
        } else {
          throw new Error(`Failed to load organization: ${data.message}`);
        }
      } catch (err) {
        console.error("Error fetching organizations: ", err);
        showNotification(
          "error",
          "Failed to Load Organizations",
          err.message || "Unable to load available organizations. Please try again."
        );
      } finally {
        setLoadingOrgs(false);
      }
    }

    fetchAvailableOrgs();
  }, [user]);

  const handleJoin = async (orgId) => {
    if (!selectedOrg) return;

    try {
      setSubmited(true);
      const res = await fetch(`http://localhost:8080/api/organization/${selectedOrg._id}/join`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        setOrgs(orgs.filter((o) => o._id !== selectedOrg._id));
        setSelectedOrg(null);
        
        showNotification(
          "success",
          "Request Sent Successfully!",
          `Your request to join "${data.organization.name}" has been sent. Please wait for approval from the organization admin.`,
           () => navigate("/home/current", { replace: true })
        );
      } else {
        throw new Error(`Failed to join organization: ${data.message}`);
      }
    } catch (err) {
      console.error("Error joining organization", err);
      setSelectedOrg(null);
      showNotification(
        "error",
        "Failed to Send Request",
        err.message || "Unable to send join request. Please try again."
      );
    } finally {
      setSubmited(false);
    }
  };
  
  const filtered = orgs.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  // const handleConfirm = () => {
  //   const pendingList = JSON.parse(localStorage.getItem("pendingRequests") || "[]");

  //   const alreadyPending = pendingList.some((org) => org.id === selectedOrg.id);
  //   if (alreadyPending) {
  //     alert(`You have already requested to join ${selectedOrg.name}.`);
  //     setSelectedOrg(null);
  //     return;
  //   }

  //   const newPending = [...pendingList, selectedOrg];
  //   localStorage.setItem("pendingRequests", JSON.stringify(newPending));

  //   alert(`Request to join "${selectedOrg.name}" sent successfully!`);
  //   navigate("/home/current?tab=pending");
  // };

  // ✅ Loading state
  if (loading || loadingOrgs) {
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
      <section className="min-h-screen bg-gray-50 flex flex-col">
        <header className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
          >
            <ChevronLeft size={18} /> Return
          </button>
          <h1 className="text-xl font-bold text-gray-800">Existing Organization</h1>
          <div className="flex items-center gap-2 text-[#23358B] font-medium">
            <span>{user?.username || "User"}</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full grid place-items-center">👤</div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <p className="text-center text-gray-600 mb-6">
            List of available organizations are listed below
          </p>

          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23358B]"
            />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* {filtered.map((org) => ( */}
            {filtered.length > 0 ? (
              filtered.map((org) => (
                <div
                  key={org._id}
                  className="flex justify-between items-center bg-white rounded-xl shadow p-4 border hover:shadow-md transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 uppercase">{org.name}</h3>
                    <p className="text-sm text-gray-500">Author: {org.createdBy?.username || "Unknown"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrg(org)}
                    className="px-4 py-2 rounded-lg bg-[#23358B] text-white hover:opacity-90"
                  >
                    Join
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
                <div className="max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800">
                    {search.trim() ? "No Organizations Found" : "No Available Organizations"}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {search.trim() ? 
                      `No organizations match "${search}". Try a different search term.` : 
                      "There are no organizations available to join at the moment."}
                  </p>
                </div>
              </div>
            )}           
          </div>
        </main>

        {/* Popup confirmation */}
        {selectedOrg && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative border border-gray-200">
              <button
                onClick={() => setSelectedOrg(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                disabled={submited}
              >
                <X size={20} />
              </button>
              <div className="text-center mt-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Are you sure you want to join
                </h2>
                <p className="text-[#23358B] font-bold mt-1 uppercase">{selectedOrg.name}?</p>
                <p className="mt-2 text-sm text-gray-500">
                  ⚠️ Note: You must wait for the author’s approval to join.
                </p>
                <div className="flex justify-center gap-6 mt-6">
                  <button
                    onClick={() => setSelectedOrg(null)}
                    className="px-6 py-2 rounded-full bg-red-700 text-white hover:opacity-90"
                    disabled={submited}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoin}
                    disabled={submited}
                    className="px-6 py-2 rounded-full bg-green-700 text-white hover:opacity-90"
                  >
                    {submited ? "Sending..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

       {/* Popup Notification */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              {popupConfig.type === "success" && (
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              )}
              {popupConfig.type === "error" && (
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
              )}
              {popupConfig.type === "warning" && (
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
              )}

              {/* Title */}
              <h2 className="text-xl font-bold text-[#23358B] mb-2">
                {popupConfig.title}
              </h2>

              {/* Message */}
              <p className="text-gray-700 mb-6">
                {popupConfig.message}
              </p>

              {/* Button */}
              <button
                onClick={closePopup}
                className={`px-8 py-2 rounded-md text-white font-semibold transition-all ${
                  popupConfig.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : popupConfig.type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
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
