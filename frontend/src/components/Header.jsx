// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { User as UserIcon, IdCard, LogOut, ArrowLeft } from "lucide-react";

export default function Header({ title }) {
  const { user, clearUser } = useUser();
  const { id: paramId } = useParams(); // ambil :id dari URL
  const location = useLocation(); // ambil path sekarang
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown saat klik di luar / tekan Escape
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

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  // ✅ Tampilkan tombol kembali jika:
  // - Tidak ada paramId (bukan di dashboard), ATAU
  // - Sedang di halaman /:id/settings
  const showBackButton =
    !paramId || (paramId && location.pathname.includes("/settings"));

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 relative">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {/* === User menu === */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <span>{user?.username || "User"}</span>
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
                navigate(paramId ? `/${paramId}/account` : "/account");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800"
            >
              <IdCard className="h-5 w-5 text-white/80" />
              <span>Account Detail</span>
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
  );
}
