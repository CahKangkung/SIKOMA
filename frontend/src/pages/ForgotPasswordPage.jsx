// src/components/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import wave from "../assets/background-forgotpass.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: panggil API reset password di sini
    navigate("/forgot/success");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden isolate">
      {/* BACKGROUND WAVE FULL */}
      <img
        src={wave}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-10 w-full h-full object-cover"
      />

      {/* CARD */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-black/10 p-8 mx-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 text-center">
          Forgot password
        </h1>
        <p className="mt-2 text-neutral-700 text-center leading-relaxed">
          Enter your email for the verification process, we will send a new
          password to your email.
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
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Continue
          </button>

          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-[#23358B] hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
