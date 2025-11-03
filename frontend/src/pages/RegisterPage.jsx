import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Anda harus menyetujui Terms & Policy sebelum mendaftar.");
      return;
    }
    // TODO: panggil API register di sini
    console.log("Register payload:", form);
  };

  return (
    <AuthLayout title="Get Started Now !" subtitle="Create your account">
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />
        <FormField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        {/* Checkbox + link Terms */}
        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700 select-none">
          <input
            type="checkbox"
            className="accent-[#23358B]"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree to{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-[#23358B] hover:underline"
            >
              Terms & Policy
            </button>
          </span>
        </label>

        {/* tombol & spacing PERSIS sama seperti login */}
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
