import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { users } from "../data/DummyData"; // ✅ import from DummyData.js
import wave from "../assets/background-forgotpass.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check registered users from DummyData
    const isRegistered = users.some(
      (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    // ❌ If not found
    if (!isRegistered) {
      alert("This email is not registered in our system.");
      return;
    }

    // ✅ Simulate reset link
    const resetLink = `${window.location.origin}/reset?token=${btoa(email)}`;
    console.log("🔗 Reset link:", resetLink);

    // ✅ Simulate email sending
    alert(`A password reset link has been sent to ${email}.\nCheck the console for the simulation link.`);

    // ✅ Redirect to success page
    navigate("/forgot/success");
  };

  return (
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
          Enter your email for the verification process. We will send a reset
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
            Send Reset Link
          </button>

          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-[#23358B] hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
