// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";
import { CheckCircle, XCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error"
    title: "",
    message: "",
  });

  const showNotification = (type, title, message) => {
    setPopupConfig({ type, title, message });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // navigate("/forgot/success");
        showNotification(
          "success",
          "Check Your Email",
          `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions to reset your password.`
        );
        setEmail(""); // Clear email field
      } else {
        // alert(data.message);
        showNotification(
          "error",
          "Failed to Send Email",
          data.message || "Unable to send password reset email. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      // alert("Something went wrong");
      showNotification(
        "error",
        "Something Went Wrong",
        "An error occurred while processing your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden isolate">
        {/* BACKGROUND WAVE */}
        <img
          src={wave}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 -z-10 w-full h-full object-cover"
        />

        {/* CARD */}
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-black/10 p-8 mx-4">
          <h1 className="text-3xl font-extrabold text-neutral-900 text-center">
            Forgot Password
          </h1>
          <p className="mt-2 text-neutral-700 text-center leading-relaxed">
            Enter your email for the verification process. We will send a new
            password link to your email.
          </p>

          <form onSubmit={onSubmit} className="mt-6">
            <label className="block text-sm font-medium text-neutral-800">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30"
              placeholder="Enter your email"
            />

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
            >
              Continue
            </button>

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-[#23358B] hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </section>

       {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              {popupConfig.type === "success" ? (
                <div className="w-20 h-20 rounded-full bg-green-50 grid place-items-center mb-4">
                  <Mail className="w-10 h-10 text-green-500" />
                </div>
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
