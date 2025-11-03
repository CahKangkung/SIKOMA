// src/pages/DashboardPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { documents } from "../data/DummyData";
import { ChevronLeft } from "lucide-react";

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const organization = location.state?.organization;

  // Jika user langsung akses /dashboard tanpa memilih organisasi
  if (!organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h2 className="text-2xl font-semibold mb-4">No Organization Selected</h2>
        <p className="mb-6 text-gray-500">
          Please go back and select an organization to view its dashboard.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-[#23358B] text-white rounded-xl hover:opacity-90 transition"
        >
          ← Back to Organizations
        </button>
      </div>
    );
  }

  // Ambil semua dokumen untuk organisasi ini
  const orgDocs = documents.filter((doc) => doc.orgId === organization.id);

  // Hitung jumlah dokumen berdasarkan status
  const counts = {
    upload: orgDocs.filter((doc) => doc.status === "upload").length,
    on_review: orgDocs.filter((doc) => doc.status === "on_review").length,
    approved: orgDocs.filter((doc) => doc.status === "approved").length,
    rejected: orgDocs.filter((doc) => doc.status === "rejected").length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Dashboard" />

        <main className="p-8">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] hover:underline mb-6"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            Organization:
          </h3>
          <h1 className="text-3xl font-bold mb-8 text-black uppercase">
            {organization.name}
          </h1>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              title="Uploaded"
              value={counts.upload}
              color="bg-blue-100"
              text="text-blue-700"
            />
            <Card
              title="On Review"
              value={counts.on_review}
              color="bg-yellow-100"
              text="text-yellow-700"
            />
            <Card
              title="Approved"
              value={counts.approved}
              color="bg-green-100"
              text="text-green-700"
            />
            <Card
              title="Rejected"
              value={counts.rejected}
              color="bg-red-100"
              text="text-red-700"
            />
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
