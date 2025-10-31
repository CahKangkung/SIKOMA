// src/pages/AccountDetailPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromOrg = location.state?.fromOrg ?? true; // default: tampil dengan sidebar

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
    name: "Unit Kegiatan Mahasiswa Kaligrafi",
    email: "Ukaligrafi@gmail.com",
    password: "Ukali.j4ya123",
    joinDate: "16 June 2024",
  };

  const content = (
    <main className="flex flex-col justify-center px-10 md:px-32 py-12">
      <div className="max-w-2xl">
        <div className="space-y-6 text-[16px]">
          <div>
            <h3 className="text-[#23358B] font-semibold">Username</h3>
            <p className="text-neutral-800 mt-1">{currentUser.name}</p>
          </div>

          <div>
            <h3 className="text-[#23358B] font-semibold">Email</h3>
            <p className="text-neutral-800 mt-1">{currentUser.email}</p>
          </div>

          <div>
            <h3 className="text-[#23358B] font-semibold">Password</h3>
            <p className="text-neutral-800 mt-1">{currentUser.password}</p>
          </div>

          <div>
            <h3 className="text-[#23358B] font-semibold">Join Date</h3>
            <p className="text-neutral-800 mt-1">{currentUser.joinDate}</p>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={() => navigate("/settings", { state: { fromOrg } })}
            className="rounded-lg bg-[#23358B] px-8 py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Setting
          </button>
        </div>
      </div>
    </main>
  );

  // === TANPA ORGANISASI ===
  if (!fromOrg) {
    return (
      <section className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center px-10 py-6 border-b">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Detail Account</span>
          </button>

          <div className="flex items-center gap-2 text-[#23358B]">
            <span>{currentUser.name}</span>
            <User className="w-6 h-6" />
          </div>
        </header>
        {content}
      </section>
    );
  }

  // === DENGAN ORGANISASI ===
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Account" />
        {content}
      </div>
    </div>
  );
}
