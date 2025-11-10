import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error" | "warning"
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

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      // alert("Passwords do not match!");
       showNotification(
        "warning",
        "Passwords Do Not Match",
        "The passwords you entered do not match. Please try again."
      );
      return;
    }

    // setLoading(true);

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
        // alert("Password reset successful!");
        // navigate("/login");
        showNotification(
          "success",
          "Password Reset Successful!",
          "Your password has been successfully reset. You can now login with your new password.",
          () => navigate("/login")
        );
      } else {
        // alert(data.message || "Failed to reset password");
        showNotification(
          "error",
          "Reset Failed",
          data.message || "Failed to reset password. Please try again or request a new reset link."
        );
      }

    } catch (error) {
      console.error("Reset password error:", error);
      // alert("Server error");
      showNotification(
        "error",
        "Server Error",
        "An error occurred while resetting your password. Please try again later."
      );
    } 
    // finally {
    //   setLoading(false);
    // }
  };

  return (
    <>
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
