// src/pages/userDashboard/CreateOrganizationPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { ChevronLeft, User as UserIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useUser();

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
      popupConfig.onConfirm();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      showNotification("warning", "Validation Error", "Organization name is required.");
      setError("Organization name is required.");
      return;
    }
    if (name.trim().length < 3){
      showNotification(
        "warning", 
        "Validation Error", 
        "Organization name must be at least 3 characters."
      );
      setError("Organization name must be at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);
      // await new Promise((r) => setTimeout(r, 1000));

      const res = await fetch("http://localhost:8080/api/organization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        // body: JSON.stringify({ name, description })
        body: JSON.stringify({ 
          name: name.trim(), 
          description: description.trim() 
        })
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(
          "success",
          "Success!",
          "Organization created successfully!",
          () => navigate("/home/current")
        );
      } else {
        throw new Error(`Failed to create organization: ${data.message}`);
      }
      
    } catch (err) {
      setError(err.message || "Something went wrong.");
      showNotification(
        "error",
        "Failed to Create Organization",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="min-h-screen flex flex-col justify-between bg-gray-50">
        <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
          >
            <ChevronLeft size={18} /> Return
          </button>
          <div className="flex items-center gap-2 text-[#23358B] font-medium">
            <span>{user?.username || "User"}</span>
            <UserIcon className="w-5 h-5" />
          </div>
        </header>

        <main className="flex flex-col items-center px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
            Create Organization
          </h1>
          <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-5">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B] resize-none"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#23358B] text-white px-5 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </main>
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
