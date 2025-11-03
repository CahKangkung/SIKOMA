// src/pages/AccountSettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Eye, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromOrg = location.state?.fromOrg ?? true; // default: tampil dengan sidebar

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
    name: "Unit Kegiatan Mahasiswa Kaligrafi",
    email: "Ukaligrafi@gmail.com",
    password: "Ukali.j4ya123",
  };

  const [form, setForm] = useState({
    username: currentUser.name,
    email: currentUser.email,
    password: currentUser.password,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Ambil data user saat halaman dibuka
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setForm({
          username: res.user.username || "",
          email: res.user.email || "",
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

  const onSave = (e) => {
    e.preventDefault();
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...currentUser,
        name: form.username,
        email: form.email,
        password: form.password,
      })
    );
    navigate("/account", { state: { fromOrg } });
  };

  const onLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const onDeleteConfirm = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenDelete(false);
    if (openDelete) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDelete]);

  const formContent = (
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
      </form>
    </main>
  );

  // === Tanpa Organisasi ===
  if (!fromOrg) {
    return (
      <section className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center px-10 py-6 border-b">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Settings</span>
          </button>

          <div className="flex items-center gap-2 text-[#23358B]">
            <span>{form.username}</span>
            <UserIcon className="w-6 h-6" />
          </div>
        </header>
        {formContent}
      </section>
    );
  }

  // === Dengan Organisasi ===
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Account Settings" />
        {formContent}
      </div>

      {/* Modal Delete */}
      {openDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenDelete(false)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 mx-4">
            <button
              onClick={() => setOpenDelete(false)}
              className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700"
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
    </div>
  );
}
