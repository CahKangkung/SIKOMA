import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.username === "admin@gmail.com" && form.password === "admin") {
      navigate("/home"); // pindah ke dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <AuthLayout title="Welcome Back !" subtitle="login to continue">
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="mt-2 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#23358B]" /> Remember me
          </label>
          <Link to="/forgot" className="text-[#23358B] hover:underline">
            Forgot Password?
          </Link>
        </div>

        {error && (
          <div className="mt-3 text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Login
        </button>

        <div className="mt-4 text-center text-sm text-neutral-600">
          Or Login with
        </div>

        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Google
        </button>

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
