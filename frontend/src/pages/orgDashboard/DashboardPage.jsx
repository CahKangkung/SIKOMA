// src/pages/DashboardPage.jsx
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getOrgStats } from "../../Services/api";

export default function DashboardPage() {
  const { id } = useParams();
  const { setCurrentOrgId } = useUser();
  const { user, loading }= useUser();
  const [org, setOrg] = useState(null);
  const navigate = useNavigate();
  // const [message, setMessage] = useState("");
  const [loadingPage, setLoadingPage] = useState(false);

  const userId = user ? (user.id || user._id) : null;

  const [stats, setStats] = useState({
    uploaded: 0,
    onReview: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!id || !userId) return;
    const fetchOrg = async () => {
      
      try {
        setLoadingPage(true);
        // console.log("🔍 Fetching organization:", id);
        // console.log("👤 Current user:", user);

        const userId = user.id || user._id;

        const res = await fetch(`http://localhost:8080/api/organization/${id}`, {
          credentials: "include"
        });

        const data = await res.json();
        console.log("📦 Organization data:", data);

        if (!res.ok) {
          throw new Error(`Failed to load organization data: ${data.message}`);
        }

        const isCreator = String(data.createdBy._id) === String(userId);
        const isMember = data.members.some((m) => String(m.user._id) === String(userId));    
        
        console.log("✅ Is Creator:", isCreator);
        console.log("✅ Is Member:", isMember);
        console.log("📋 Members list:", data.members.map(m => m.user._id));
        console.log("🆔 User ID:", userId);

        if (!isMember && !isCreator) {
          alert("You are not authorized to access this organization");
          navigate("/home/current");
          return;
        }

        setOrg(data);
      } catch (err) {
        console.error("Error fetching organization data: ", err);
        navigate("/home/current");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchOrg();

    // eslint-disable-next-line react-hooks/exhaustive-deps    
  }, [id, user, navigate]);

  useEffect(() => {
    if (!id || !userId) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await getOrgStats(id);
        if (!cancelled) setStats(data.stats || {});
      } catch (e) {
        if (!cancelled) console.error("Failed to fetch stats:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  useEffect(() => {
    if (id) setCurrentOrgId(id);
  }, [id, setCurrentOrgId]);

  if (loading || loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23358B] mx-auto"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar orgId={id} />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Dashboard" />

        <main className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">
            Organization:
          </h3>
          <h1 className="text-3xl font-bold mb-8 text-black">
            {org?.name || "Loading..."}
          </h1>

          <h2 className="text-lg font-semibold mb-2">Organization Info</h2>
          {org ? (
            <>
              <p><strong>Author: </strong>{org.createdBy?.username}</p>
              <p><strong>Total Members: </strong>{org.members.length}</p>
              <p><strong>Your Role:</strong> {
                  org.members.find((m) => m.user._id === userId)?.role || "Unknown"
              }</p>
            </>
          ) : (
            <p className="text-gray-500">Loading organization info...</p>
          )}
          

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Uploaded" value={stats.uploaded ?? 0} color="bg-blue-100" text="text-blue-700" />
            <Card title="On Review" value={stats.onReview ?? 0} color="bg-yellow-100" text="text-yellow-700" />
            <Card title="Approved" value={stats.approved ?? 0} color="bg-green-100" text="text-green-700" />
            <Card title="Rejected" value={stats.rejected ?? 0} color="bg-red-100" text="text-red-700" />
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ title, value, color, text }) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm ${color}`}>
      <h4 className={`text-sm font-medium ${text}`}>{title}</h4>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
