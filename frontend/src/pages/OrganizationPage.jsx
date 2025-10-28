import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import { Plus, Search, ChevronLeft } from "lucide-react";

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const title = useMemo(() => "Your Organization", []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header title={title} />

        <main className="p-8 space-y-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline">
            <ChevronLeft size={18}/> Return
          </button>

          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-800">Your Organization</h3>
            <button
              onClick={() => navigate("/organizations/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#23358B] text-white rounded-xl shadow hover:opacity-90 transition">
              <Plus size={18}/> Create New Organization
            </button>
          </div>

          <p className="text-sm text-gray-500">
            List of your currently joined &amp; created organizations
          </p>

          <div className="flex items-center gap-3">
            <select defaultValue="all" className="px-3 py-2 bg-white border rounded-xl text-sm">
              <option value="all">All</option>
              <option value="owner">Owner</option>
              <option value="member">Member</option>
            </select>

            <div className="relative flex-1 max-w-xl">
              <input type="text" placeholder="Search organization..." className="w-full pl-4 pr-10 py-2 bg-white border rounded-xl text-sm outline-none"/>
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            </div>
          </div>

          {/* Empty state */}
          <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 grid place-items-center">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 grid place-items-center">👥</div>
              <h4 className="font-semibold text-gray-800">No Organization Found</h4>
              <p className="mt-1 text-sm text-gray-500">To access features, join an existing organization or create a new one.</p>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button onClick={() => navigate("/organizations?mode=join")} className="px-4 py-2 rounded-xl bg-[#23358B] text-white hover:opacity-90">JOIN</button>
                <span className="text-sm text-gray-400">or</span>
                <button onClick={() => navigate("/organizations/new")} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">CREATE</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
