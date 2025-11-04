// src/components/Sidebar.jsx
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { Home, FileText, Users, User, ArrowLeftCircle } from "lucide-react";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentOrgId = id;

  const menu = [
    { name: "Dashboard", icon: Home, path: `/${currentOrgId}/dashboard`, end: true }, // exact
    { name: "Manage Document", icon: FileText, path: `/${currentOrgId}/manage-document` },
    { name: "Organization", icon: Users, path: `/${currentOrgId}/organization` },
    { name: "Member", icon: User, path: `/${currentOrgId}/member` },
    { name: "Account", icon: User, path: `/account` },
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
            end={item.end} // hanya Dashboard yang exact
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mb-1 rounded-lg text-sm font-medium transition
               ${isActive ? "bg-[#23358B] text-white" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={() => navigate("/home")}
        className="mt-auto flex items-center gap-2 px-4 py-2 text-[#23358B] hover:bg-blue-50 rounded-lg transition font-medium">
        <ArrowLeftCircle size={20} /> Back to Home
      </button>
    </aside>
  );
}
