import React, {useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { getCurrentUser } from "../Services/api";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data.user);
      } catch (error) {
        console.error(err);
        setError("Failed to fetch user data. Please log in again");
      } finally {
        setLoading(false);
      }
    };
  })

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Detail Account</span>
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
              <p className="text-neutral-800 mt-1">
                Unit Kegiatan Mahasiswa Kaligrafi
              </p>
            </div>

            <div>
              <h3 className="text-[#23358B] font-semibold">Email</h3>
              <p className="text-neutral-800 mt-1">
                Ukaligrafi@gmail.com
              </p>
            </div>

            <div>
              <h3 className="text-[#23358B] font-semibold">Password</h3>
              <p className="text-neutral-800 mt-1">
                Ukali.j4ya123
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
