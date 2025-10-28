import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { LogOut, Building2, PlusSquare, User as UserIcon, IdCard } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // fungsi logout → arahkan ke halaman login
  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  // Tutup dropdown kalau klik di luar atau tekan ESC
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-between bg-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        {/* Kiri: logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="SIKOMA" className="h-8 w-auto" />
        </div>

        {/* Kanan: User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <span>User</span>
            <UserIcon className="w-6 h-6" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-neutral-900 text-white shadow-2xl ring-1 ring-black/10 z-50"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800"
              >
                <IdCard className="h-5 w-5 text-white/80" />
                <span>Detail Account</span>
              </button>
              <div className="h-px bg-white/10" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-10">
        <h1 className="text-4xl font-extrabold text-neutral-800">Welcome, User!</h1>
        <p className="mt-2 text-neutral-600">
          You're not part of any organization yet. Let's get started
        </p>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button className="rounded-xl border p-8 hover:shadow-lg transition">
            <Building2 className="w-10 h-10 mx-auto text-[#5A6BF5]" />
            <p className="mt-4 font-semibold text-neutral-800">Join Existing Organization</p>
          </button>

          <button className="rounded-xl border p-8 hover:shadow-lg transition">
            <PlusSquare className="w-10 h-10 mx-auto text-green-600" />
            <p className="mt-4 font-semibold text-neutral-800">Create New Organization</p>
          </button>

          <button
            onClick={handleLogout}
            className="rounded-xl border p-8 hover:shadow-lg transition"
          >
            <LogOut className="w-10 h-10 mx-auto text-red-500" />
            <p className="mt-4 font-semibold text-neutral-800">Logout</p>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-neutral-500 border-t">
        © 2025 SIKOMA. Simplify, track and connect with SIKOMA
      </footer>
    </section>
  );
}
