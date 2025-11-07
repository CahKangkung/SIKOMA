// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { useUser } from "../context/UserContext";
import { CheckCircle, XCircle } from "lucide-react";
// import { users } from "../data/DummyData";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error"
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
  };

  // handle input
  const handleChange = (e) =>
    setForm((prev) => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        await refetchUser();
        showNotification(
          "success",
          "Login Successful!",
          "Welcome back! Redirecting to home...",
          () => navigate("/home")
        );
      } else {
        throw new Error(data.message || "Login failed");
        // throw new Error(`Login Failed: ${data.message}`);
      }      

    } catch (err) {
      setError(err.message);
      showNotification(
        "error",
        "Login Failed",
        err.message || "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <AuthLayout title="Welcome Back!" subtitle="Login to continue">
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          {/* Password field */}
          <FormField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {/* Remember & Forgot */}
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[#23358B]" /> Remember me
            </label>
            <Link to="/forgot" className="text-[#23358B] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Login..." : "Login"}
          </button>

          {/* Alternative login */}
          <div className="mt-4 text-center text-sm text-neutral-600">
            Or Login with
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Google
          </button>

          {/* Register link */}
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#23358B] hover:underline">
              Register
            </Link>
          </div>
        </form>
      </AuthLayout>

      {/* 🔴 POPUP NOTIFICATION - YANG HILANG! */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              {popupConfig.type === "success" ? (
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
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
                    : "bg-red-600 hover:bg-red-700"
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
