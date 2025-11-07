import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const {user, loading} = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      return navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <section className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-6 border-b">
        <button
          onClick={() => navigate(-1)}
          // onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Detail Account</span>
        </button>

        <div className="flex items-center gap-2 text-[#23358B]">
          <span>{user?.username || "User"}</span>
          <User className="w-6 h-6" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col justify-center px-10 md:px-32 py-12">
        <div className="max-w-2xl">
          <div className="space-y-6 text-[16px]">            
            <div>
              <h2 className="text-[#23358B] font-semibold" style={{ fontSize: "20px"}}>Username</h2>
              <p className="text-neutral-800 mt-1" style={{ fontSize: "30px" }}>
                {user?.username || "Loading..."}
              </p>
            </div>

            <div>
              <h2 className="text-[#23358B] font-semibold" style={{ fontSize: "20px"}}>Email</h2>
              <p className="text-neutral-800 mt-1" style={{ fontSize: "30px" }}>
                {user?.email || "Loading..."}
              </p>
            </div>

            {/* <div>
              <h3 className="text-[#23358B] font-semibold">Password</h3>
              <p className="text-neutral-800 mt-1">
                Ukali.j4ya123
              </p>
            </div> */}
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
