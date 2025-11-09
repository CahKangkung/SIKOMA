import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful!");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password");
      }

    } catch (error) {
      console.error("Reset password error:", error);
      alert("Server error");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden isolate">
      <img src={wave} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover" />

      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl ring-1 ring-black/10 p-10 mx-4">
        <h2 className="text-3xl font-bold text-center text-[#133962] mb-6">
          Reset Password
        </h2>        

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
