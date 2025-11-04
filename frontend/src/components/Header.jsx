// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

export default function Header({ title, notifications = [] }) {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(notifications.some((n) => !n.read));
  const menuRef = useRef(null);

  // Tutup popup saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Saat notifikasi dibuka, tandai sebagai sudah dibaca
  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (hasNew) setHasNew(false);
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-50 relative">
      {/* Judul */}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      {/* Notifikasi */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleOpen}
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell className="w-6 h-6 text-[#23358B]" />
          {hasNew && (
            <span className="absolute top-2 right-2 block w-2 h-2 rounded-full bg-red-500"></span>
          )}
        </button>

        {/* Popup / Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-50 rounded-xl shadow-xl z-50">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto divide-y">
                {notifications.map((n, i) => (
                  <li
                    key={i}
                    className={`px-4 py-3 text-sm ${
                      n.read ? "bg-white" : "bg-blue-50"
                    } hover:bg-gray-50 transition`}
                  >
                    <p className="text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.time || "Just now"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">
                No new notifications
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
