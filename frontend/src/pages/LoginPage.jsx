import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { loginUser, googleLogin } from "../Services/api"; // ✅ Tambahkan import ini

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Handle perubahan input
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle submit login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form); // ✅ panggil API backend login
      console.log(res.user)
      localStorage.setItem("currentUser", JSON.stringify(res.user));
      navigate("/home"); // redirect setelah login berhasil
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      console.log(error)
    }
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Login to continue">
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <FormField
          label="Email"
          name="email"
          type="email"
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

        {/* Tombol login */}
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Login
        </button>

        {/* Login alternatif */}
        <div className="mt-4 text-center text-sm text-neutral-600">
          Or Login with
        </div>

        {/* Tombol Google login */}
        <button
          type="button"
          onClick={googleLogin} // ✅ panggil fungsi redirect ke Google
          className="mt-3 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Google
        </button>

        {/* Link ke Register */}
        <div className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#23358B] hover:underline">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
