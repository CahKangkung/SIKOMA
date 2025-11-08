// src/components/Sidebar.jsx
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { Home, FileText, Users, User, ArrowLeftCircle } from "lucide-react";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const { id } = useParams();           // cukup sekali
  const navigate = useNavigate();

  // Guard: kalau belum ada orgId dari URL, jangan render menu org
  if (!id) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src={logo} alt="SIKOMA logo" className="h-8 w-auto md:h-10" />
        </div>
        <div className="text-sm text-gray-500 px-2">
          No organization selected.
        </div>
        <button
          onClick={() => navigate("/home")}
          className="mt-auto flex items-center gap-2 px-4 py-2 text-[#23358B] hover:bg-blue-50 rounded-lg transition font-medium"
        >
          <ArrowLeftCircle size={20} /> Back to Home
        </button>
      </aside>
    );
  }

  const menu = [
    { name: "Dashboard",       icon: Home,    path: `/${id}/dashboard`, end: true },
    { name: "Manage Document", icon: FileText, path: `/${id}/manage-document` },
    { name: "Organization",    icon: Users,    path: `/${id}/organization` },
    { name: "Member",          icon: User,     path: `/${id}/member` },
    // 👉 dari sidebar harus versi org (biar tetap ada sidebar)
    { name: "Account",         icon: User,     path: `/${id}/account` },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <img src={logo} alt="SIKOMA logo" className="h-8 w-auto md:h-10" />
      </div>

      {/* Menu */}
      <nav className="flex-1">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mb-1 rounded-lg text-sm font-medium transition
               ${isActive ? "bg-[#23358B] text-white" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to home */}
      <button
        onClick={() => navigate("/home")}
        className="mt-auto flex items-center gap-2 px-4 py-2 text-[#23358B] hover:bg-blue-50 rounded-lg transition font-medium"
      >
        <ArrowLeftCircle size={20} /> Back to Home
      </button>
    </aside>
  );
}
