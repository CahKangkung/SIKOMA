// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { useUser } from "../context/UserContext";
import { googleLogin } from "../Services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    
    if (errorParam === "google_auth_failed") {
      setError("Google login failed. Please try again.");
    } else if (errorParam === "account_deleted") {
      setError("This account has been deleted.");
    }
  }, []);

  // handle perubahan input
  const handleChange = (e) =>
    setForm((prev) => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));

  // handle submit login
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
        alert("Login Successful!");
        navigate("/home");
      } else {
        throw new Error(`Login Failed: ${data.message}`);
      }      

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    
  };

  return (
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

        {/* Login button */}
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
        {/* Tombol Google login */}
        <button
          type="button"
          onClick={googleLogin}
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
  );
}
