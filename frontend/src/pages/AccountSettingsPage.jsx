// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ArrowLeft, User as UserIcon, Eye, X } from "lucide-react";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); 
  const { user, loading, refetchUser, clearUser } = useUser();

  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });

  // show-on-press untuk password
  const [showPassword, setShowPassword] = useState(false);

  // modal state
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      return navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
    
  // const onSave = (e) => {
  //   e.preventDefault();
  //   // TODO: panggil API update profile
  //   navigate("/dashboard");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Profile updated successfully!")
        // alert(`✅ Profile updated successfully!`);
        await refetchUser();
        // navigate("/settings");
      } else {
        //throw new Error(`Failed to update profile: ${data.message}`);
        setMessage("❌ Failed to update profile");
      }
    } catch (err) {      
      console.error("Error updating profile:", err);
      setMessage("❌ Error updating profile")
      // alert("❌ Failed to update profile");
    }
  }

  // const onLogout = () => navigate("/login");
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

  // const onDeleteConfirm = () => {
  //   // TODO: panggil API delete account
  //   navigate("/login");
  // };

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== "confirm") return;

    try {
      const res = await fetch("http://localhost:8080/api/auth/delete", {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();

      if(res.ok) {
        alert("🗑️ Account deleted successfully!");
        clearUser();
        navigate("/login");
      } else {
        throw new Error(`Failed to delete account: ${data.message}`);
      }

    } catch (err) {
      console.error("Error deleting account:", err);
      alert("❌ Failed to delete account");
    }
  }

  // ESC to close modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenDelete(false);
    };
    if (openDelete) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDelete]);

  if (loading) {
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
    <section className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        <button
          onClick={() => navigate(-1)}
          // onClick={() => navigate("/account")}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Settings</span>
        </button>        

        <div className="flex items-center gap-2 text-[#23358B]">
          <span>{user?.username || "User"}</span>
          <UserIcon className="w-6 h-6" />
        </div>
      </header>

      {/* Content */}
      <main className="px-10 md:px-32 py-10">
        {message && (
          <div className={`p-4 rounded-md ${message.includes("❌") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`} style={{ marginBottom: "15px" }}>
            {message}
            <button 
              onClick={() => setMessage("")}
              className="ml-4"              
            >
              X
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Username */}
          <label className="block text-[#23358B] font-semibold">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30"
          />

          {/* Email */}
          <label className="block mt-6 text-[#23358B] font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30"
          />

          {/* Password (hold to reveal) */}
          <label className="block mt-6 text-[#23358B] font-semibold">Password <p style={{ fontSize: "12px"}}>(leave blank to keep current)</p></label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#23358B]/30"
            />
            {/* <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#23358B]"
              aria-label="Hold to show password"
            >
              <Eye className="h-5 w-5" />
            </button> */}
          </div>

          {/* Save */}
          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-[#23358B] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Save
          </button>

          {/* Delete & Logout */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setConfirmText("");
                setOpenDelete(true);
              }}
              className="rounded-xl bg-[#FF5353] py-3 text-white font-semibold hover:opacity-90 transition"
            >
              Delete Account
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-neutral-500 py-3 text-white font-semibold hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </form>
      </main>

      {/* DELETE MODAL */}
      {openDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenDelete(false)}
          />
          {/* dialog */}
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 mx-4">
            <button
              onClick={() => setOpenDelete(false)}
              className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-3xl font-extrabold text-[#23358B] text-center">
              Delete Account
            </h2>
            <p className="mt-3 text-center text-neutral-700">
              To permanently delete your account please type “<b>confirm</b>”
              <br />
              <span className="text-red-600 text-sm">
                Warning: This action is permanent
              </span>
            </p>

            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="confirm"
              className="mt-5 w-full rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30"
            />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setOpenDelete(false)}
                className="rounded-lg bg-neutral-300 py-3 font-semibold text-white hover:opacity-90 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText.trim().toLowerCase() !== "confirm"}
                className={`rounded-lg py-3 font-semibold text-white transition
                  ${
                    confirmText.trim().toLowerCase() === "confirm"
                      ? "bg-[#B3261E] hover:opacity-90"
                      : "bg-[#B3261E]/50 cursor-not-allowed"
                  }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
