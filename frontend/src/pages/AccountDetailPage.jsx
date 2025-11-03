import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { users, organizations } from "../data/DummyData";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user); // ⬅️ backend kamu kirim { user: {...} }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch user data. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // ⬅️ pakai dependency kosong biar tidak loop

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#23358B]">
        Loading user data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#23358B]">
        No user data found.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Account Details</span>
        </button>

        <div className="flex items-center gap-2 text-[#23358B]">
          <span>User</span>
          <User className="w-6 h-6" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col justify-center px-10 md:px-32 py-12">
        <div className="max-w-2xl">
          <div className="space-y-6 text-[16px]">
            <div>
              <h3 className="text-[#23358B] font-semibold">Username</h3>
              <p className="text-neutral-800 mt-1">{user.username}</p>
            </div>

            <div>
              <h3 className="text-[#23358B] font-semibold">Email</h3>
              <p className="text-neutral-800 mt-1">{user.email}</p>
            </div>

            <div>
              <h3 className="text-[#23358B] font-semibold">Password</h3>
              <p className="text-neutral-800 mt-1 italic text-neutral-500">
                ******** (hidden for security)
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/settings")}
            className="mt-10 rounded-lg bg-[#23358B] px-8 py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Settings
          </button>
        </div>
      </main>
    </section>
  );
}
