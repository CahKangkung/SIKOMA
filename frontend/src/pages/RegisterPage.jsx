import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { registerUser, googleLogin } from "../Services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  // Fungsi untuk handle input perubahan
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Fungsi untuk handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Get Started Now !" subtitle="Create your account">
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <FormField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />

        {/* Email */}
        <FormField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password */}
        <FormField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-sm text-center mt-2">{error}</p>
        )}

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="accent-[#23358B]" />
          I agree to term & policy
        </label>

        {/* Tombol register */}
        <button
          type="submit"
          disabled={!agree}
          className={`mt-6 w-full rounded-xl py-3 font-semibold transition ${
            agree
              ? "bg-[#133962] text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Register
        </button>

        <div className="mt-4 text-center text-sm text-neutral-600">
          Or Login with
        </div>

        {/* Tombol Google */}
        <button
          type="button"
          onClick={googleLogin}
          className="mt-3 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Google
        </button>

        <div className="mt-6 text-center text-sm">
          Have an account?{" "}
          <Link to="/login" className="text-[#23358B] hover:underline">
            Login
          </Link>
        </div>
      </form>

      {/* Modal Terms & Policy */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-11/12 max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-[#23358B]">Terms & Policy</h3>
            <div className="mt-3 max-h-64 overflow-y-auto text-sm text-gray-700 space-y-2">
              <p>
                Dengan menggunakan layanan ini, Anda setuju untuk tidak
                menyalahgunakan sistem atau melakukan aktivitas yang melanggar
                hukum.
              </p>
              <p>
                Data pribadi Anda dikelola sesuai kebijakan privasi kami dan
                tidak dibagikan tanpa persetujuan.
              </p>
              <p>
                Kami dapat memperbarui syarat ini sewaktu-waktu. Harap tinjau
                secara berkala.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgree(true);
                  setShowTerms(false);
                }}
                className="rounded-lg bg-[#133962] px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
