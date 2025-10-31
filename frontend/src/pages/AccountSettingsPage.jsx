import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Eye, X } from "lucide-react";
import { getCurrentUser, updateUser, deleteUser } from "../Services/api";

export default function AccountSettingsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Ambil data user saat halaman dibuka
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setForm({
          username: res.data.user.username || "",
          email: res.data.user.email || "",
          password: "", // password tidak dikembalikan dari server
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load user data. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ✅ Update ke database
  const onSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUser(form);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => navigate("/account"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  // ✅ Delete account dari database
  const onDeleteConfirm = async () => {
    try {
      await deleteUser();
      setMessage("🗑️ Account deleted successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete account");
    }
  };

  const onLogout = () => navigate("/login");

  // ESC untuk tutup modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenDelete(false);
    if (openDelete) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDelete]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-[#23358B]">
        Loading user data...
      </div>
    );

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Settings</span>
        </button>

        <div className="flex items-center gap-2 text-[#23358B]">
          <span>User</span>
          <UserIcon className="w-6 h-6" />
        </div>
      </header>

      {/* Content */}
      <main className="px-10 md:px-32 py-10">
        <form onSubmit={onSave} className="max-w-2xl">
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

          {/* Password */}
          <label className="block mt-6 text-[#23358B] font-semibold">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#23358B]/30"
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#23358B]"
            >
              <Eye className="h-5 w-5" />
            </button>
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
              onClick={onLogout}
              className="rounded-xl bg-neutral-500 py-3 text-white font-semibold hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>

          {/* Status message */}
          {message && (
            <p className="mt-4 text-center text-sm text-[#23358B]">{message}</p>
          )}
        </form>
      </main>

      {/* DELETE MODAL */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDelete(false)} />
          {/* dialog */}
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 mx-4">
            <button
              onClick={() => setOpenDelete(false)}
              className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-3xl font-extrabold text-[#23358B] text-center">Delete Account</h2>
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
                onClick={onDeleteConfirm}
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
