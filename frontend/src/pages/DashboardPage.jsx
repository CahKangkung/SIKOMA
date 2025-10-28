// src/pages/DashboardPage.jsx
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Dashboard" />

        <main className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">
            Organization:
          </h3>
          <h1 className="text-3xl font-bold mb-8 text-black">
            KELOMPOK PROYEK WEB
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Uploaded" value="50" color="bg-blue-100" text="text-blue-700" />
            <Card title="On Review" value="30" color="bg-yellow-100" text="text-yellow-700" />
            <Card title="Approved" value="20" color="bg-green-100" text="text-green-700" />
            <Card title="Rejected" value="10" color="bg-red-100" text="text-red-700" />
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
