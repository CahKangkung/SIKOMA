// src/pages/AccountDetailPage.jsx
import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { id: orgId } = useParams();        // ✅ hanya dari URL /:id/...
  const { user, loading } = useUser();

  const inDashboard = !!orgId;  

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
  }, [user, loading, navigate]);

  if (inDashboard) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar dashboard */}
        <Sidebar orgId={orgId} activePage="Account" />

        <div className="flex-1 ml-64 flex flex-col">
          <Header title="Account Detail" />
          <main className="flex flex-col justify-center px-10 md:px-15 py-12">
            <div className="max-w-2xl">
              {/* <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </button> */}

              <div className="space-y-6">
                <div>
                  <h2 className="text-[#23358B] font-semibold text-xl">Username</h2>
                  <p className="text-neutral-900 mt-1 text-xl">{user?.username || "Loading..."}</p>
                </div>

                <div>
                  <h2 className="text-[#23358B] font-semibold text-xl">Email</h2>
                  <p className="text-neutral-900 mt-1 text-xl">{user?.email || "Loading..."}</p>
                </div>

                <button
                  onClick={() => navigate(`/${orgId}/settings`)}
                  className="mt-6 rounded-lg bg-[#23358B] px-8 py-3 text-white font-semibold hover:opacity-90 transition"
                >
                  Settings
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
       <Header title="Account Detail" />

      {/* MAIN CONTENT */}
      <main className="flex flex-col justify-center px-10 md:px-32 py-12">
        <div className="max-w-2xl">
           <div className="space-y-8">
            <div>
              <h2 className="text-[#23358B] font-semibold text-xl">Username</h2>
              <p className="text-neutral-900 mt-1 text-xl">{user?.username || "Loading..."}</p>
            </div>

            <div>
              <h2 className="text-[#23358B] font-semibold text-xl">Email</h2>
              <p className="text-neutral-900 mt-1 text-xl">{user?.email || "Loading..."}</p>
            </div>

            <button
              onClick={() => navigate("/settings")}
              className="mt-6 rounded-lg bg-[#23358B] px-8 py-3 text-white font-semibold hover:opacity-90 transition"
            >
              Settings
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}
