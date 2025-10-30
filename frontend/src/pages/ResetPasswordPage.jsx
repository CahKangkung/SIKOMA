import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");

  // Ambil token email dari URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      const decodedEmail = atob(token);
      setEmail(decodedEmail);
    }
  }, [location]);

  const handleReset = (e) => {
    e.preventDefault();

    if (!password.trim() || !confirm.trim()) {
      alert("Password cannot be empty!");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    // TODO: kirim password baru ke backend
    alert(`Password for ${email} has been reset successfully!`);
    navigate("/login");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden isolate">
      <img
        src={wave}
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover"
        aria-hidden
      />

      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl ring-1 ring-black/10 p-10 mx-4">
        <h2 className="text-3xl font-bold text-center text-[#133962] mb-6">
          Reset Password
        </h2>

        {email && (
          <p className="text-center text-sm text-gray-600 mb-4">
            Resetting password for <strong>{email}</strong>
          </p>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-[#133962]/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-[#133962]/30"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </section>
  );
}
