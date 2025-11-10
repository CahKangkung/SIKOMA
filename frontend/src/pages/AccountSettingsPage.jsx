// src/components/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import { ArrowLeft, User as UserIcon, Eye, X } from "lucide-react";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { id: orgId } = useParams(); // hanya dari URL
  const inDashboard = !!orgId; // sidebar hanya jika ada :id
  const { user, loading, refetchUser, clearUser } = useUser();

  const [message, setMessage] = useState(""); 
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });

  // show-on-press untuk password
  const [showPassword] = useState(false);

  // modal delete
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Redirect jika belum login
  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
  }, [user, loading, navigate]);

  // Sync form ketika user selesai ter-load/refetch
  useEffect(() => {
    setForm((f) => ({
      ...f,
      username: user?.username || "",
      email: user?.email || "",
    }));
  }, [user]);

  // Auto dismiss alert
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };    

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setMessage("✅ Profile updated successfully!")
        await refetchUser();
      } else {
        setMessage("❌ Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("❌ Error updating profile")
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== "confirm") return;
    try {
      const res = await fetch("http://localhost:8080/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
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
  };

  // ESC to close modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenDelete(false);
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

  // ====== Konten utama (dipakai di kedua layout) ======
  const Content = (
    <>
      {message && (
        <div className={`p-4 rounded-md ${
            message.includes("❌") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          } mb-4`}>
             {message}
          <button onClick={() => setMessage("")} className="ml-4">X</button>
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
        <label className="block mt-6 text-[#23358B] font-semibold">
          Email
          {user?.googleId && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Google account - cannot be changed)
            </span>
          )}
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={!!user?.googleId}
          className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30 ${
            user?.googleId 
              ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
              : "border-neutral-300"
          }`}
        />

        {/* Password */}
        {!user?.googleId && (
          <>
            <label className="block mt-6 text-[#23358B] font-semibold">
              Password <p className="text-xs">(leave blank to keep current)</p>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#23358B]/30"
              />
            </div>
          </>
        )}

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

      {/* DELETE MODAL */}
      {openDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDelete(false)} />
            <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 mx-4">
            <button
              onClick={() => setOpenDelete(false)}
              className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-3xl font-extrabold text-[#23358B] text-center">Delete Account</h2>
            <p className="mt-3 text-center text-neutral-700">
              To permanently delete your account please type “<b>confirm</b>”
              <br />
              <span className="text-red-600 text-sm">Warning: This action is permanent</span>
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
                className={`rounded-lg py-3 font-semibold text-white transition ${
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
    </>
  );

  // ====== Layout berdasar konteks ======
  if (inDashboard) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar orgId={orgId} activePage="Account" />
        <div className="flex-1 ml-64 flex flex-col">
          <Header title="Settings" />
          <main className="px-10 md:px-15 py-10">
            {/* <button
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button> */}
            {Content}
          </main>
        </div>
      </div>
    );
  }

  // Tanpa sidebar (/settings)
  return (
    <section className="min-h-screen bg-white flex flex-col">
      <Header title="Settings" />
      <main className="px-10 md:px-32 py-10">
        {/* <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button> */}
        {Content}
      </main>
    </section>
  );
}

