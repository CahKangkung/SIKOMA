import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function RegisterPage() {
  return (
    <AuthLayout title="Get Started Now !" subtitle="Create your account">
      <form>
        <FormField label="Username" name="username" />
        <FormField label="Email" type="email" name="email" />
        <FormField label="Password" type="password" name="password" />

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="accent-[#23358B]" />
          I agree to term & policy
        </label>

        {/* tombol & spacing PERSIS sama seperti login */}
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Register
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
          Have an account?{" "}
          <Link to="/login" className="text-[#23358B] hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
