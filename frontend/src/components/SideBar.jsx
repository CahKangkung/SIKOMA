// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { Home, FileText, Users, User, LogOut } from "lucide-react";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Manage Document", icon: <FileText size={20} />, path: "/manage-document" },
    { name: "Organization", icon: <Users size={20} />, path: "/organization" },
    { name: "Member", icon: <User size={20} />, path: "/member" },
    { name: "Account", icon: <User size={20} />, path: "/account" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <img src={logo} alt="SIKOMA logo" className="h-8 w-auto md:h-10" />
      </div>

      {/* Menu */}
      <nav className="flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mb-1 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-[#23358B] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <button
        onClick={() => { localStorage.removeItem("isLoggedIn");
        window.location.href = "/login";
        }}
        className="mt-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
        <LogOut size={20} />Logout
        </button>

    </aside>
  );
}
