// src/components/ForgotPasswordSuccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";

export default function ForgotPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden isolate">
      <img
        src={wave}
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover"
        aria-hidden
      />

      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl ring-1 ring-black/10 p-10 mx-4 text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-white grid place-content-center ring-1 ring-gray-200">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#133962]">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#BFCBE0" strokeWidth="2"/>
            <path d="M7 12l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-3xl font-semibold text-[#133962]">Check Your Email</h2>
        <p className="mt-2 text-neutral-600">
          We’ve sent a password reset link to your email. Please follow the instructions to reset your password.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-8 w-full rounded-lg bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          BACK TO LOGIN
        </button>
      </div>
    </section>
  );
}
