// src/pages/CreateOrganizationPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { ChevronLeft, User as UserIcon, IdCard, LogOut, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Header from "../../components/Header";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const { user, clearUser } = useUser();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // if (!name.trim()) return setError("Organization name is required.");
     if (!name.trim()) {
      showNotification("warning", "Validation Error", "Organization name is required.");
      setError("Organization name is required.");
      return;
    }
    // if (name.trim().length < 3)
    //   return setError("Organization name must be at least 3 characters.");
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
      await new Promise((r) => setTimeout(r, 1000));

      const res = await fetch("http://localhost:8080/api/organization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, description })
      });

      const data = await res.json();

      if (res.ok) {
        // alert("Organization created successfully!");
        // navig ate("/home/current");
         showNotification(
          "success",
          "Success!",
          "Organization created successfully!",
          () => navigate("/home/current")
        );
      } else {
        throw new Error(`Failed to create organization: ${data.message}`);
      }
      
    } catch {
      // setError("Something went wrong.");
      setError(err.message || "Something went wrong.");
      showNotification(
        "error",
        "Failed to Create Organization",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
      const onClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      };
      const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }, []);
  
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  return (
    <>
      <section className="min-h-screen flex flex-col justify-between bg-gray-50">
        <Header title="Create Organization" />

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
