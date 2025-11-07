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
          className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
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
    </AuthLayout>
  );
}
