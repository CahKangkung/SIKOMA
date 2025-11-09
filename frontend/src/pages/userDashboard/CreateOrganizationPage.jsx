// src/pages/CreateOrganizationPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { ChevronLeft, User as UserIcon, IdCard, LogOut } from "lucide-react";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, clearUser } = useUser();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Organization name is required.");
    if (name.trim().length < 3)
      return setError("Organization name must be at least 3 characters.");

    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 1000));

      const res = await fetch("http://localhost:8080/api/organization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, description })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Organization created successfully!");
        navigate("/home/current");
      } else {
        throw new Error(`Failed to create organization: ${data.message}`);
      }
      
    } catch {
      setError("Something went wrong.");

    } finally {
      setSubmitting(false);
    }
  };

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
  
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  return (
    <section className="min-h-screen flex flex-col justify-between bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <span>{user?.username || "User"}</span>
            <UserIcon className="w-5 h-5" />
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

      <main className="flex flex-col items-center px-6 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Create Organization
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-5">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B] resize-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#23358B] text-white px-5 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}
