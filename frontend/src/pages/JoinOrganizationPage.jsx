import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { useState } from "react";

export default function JoinOrganizationPage() {
  const navigate = useNavigate();

  // Dummy data organisasi
  const [organizations] = useState([
    { id: 1, name: "PERSATUAN BOLA BASKET", author: "Budiman" },
    { id: 2, name: "ORGANISASI DESAIN GRAFIS", author: "Tono" },
    { id: 3, name: "KELOMPOK KELINCI PERCOBAAN", author: "Lina" },
    { id: 4, name: "HIMPUNAN PECINTA KOPI", author: "Rafi" },
    { id: 5, name: "KLUB PROGRAMMER MUDA", author: "Andi" },
  ]);

  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);

  const filtered = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  // Fungsi join confirm
  const handleConfirm = () => {
    alert(`You requested to join ${selectedOrg.name}. Please wait for author approval.`);
    setSelectedOrg(null);
  };

  return (
    <section className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>

        <h1 className="text-xl font-bold text-gray-800">Existing Organization</h1>

        <div className="flex items-center gap-2 text-[#23358B] font-medium">
          <span>User</span>
          <div className="w-8 h-8 bg-gray-200 rounded-full grid place-items-center">👤</div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <p className="text-center text-gray-600 mb-6">
          List of available organizations are listed below
        </p>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23358B]"
          />
        </div>

        {/* List of organizations */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="flex justify-between items-center bg-white rounded-xl shadow p-4 border hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-gray-800 uppercase">{org.name}</h3>
                <p className="text-sm text-gray-500">Author: {org.author}</p>
              </div>
              <button
                onClick={() => setSelectedOrg(org)}
                className="px-4 py-2 rounded-lg bg-[#23358B] text-white hover:opacity-90"
              >
                Join
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No organization found.
            </p>
          )}
        </div>
      </main>

      {/* Popup konfirmasi */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative border border-gray-200">
            <button
              onClick={() => setSelectedOrg(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center mt-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Are you sure you want to join
              </h2>
              <p className="text-[#23358B] font-bold mt-1 uppercase">
                {selectedOrg.name}?
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Note: You must wait the author approval to join
              </p>

              <div className="flex justify-center gap-6 mt-6">
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="px-6 py-2 rounded-full bg-red-700 text-white hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 rounded-full bg-green-700 text-white hover:opacity-90"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
