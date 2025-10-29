import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronLeft, User as UserIcon } from "lucide-react";

export default function CurrentOrganizationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fungsi menentukan tampilan "empty state" sesuai filter
  const renderEmptyState = () => {
    if (filter === "joined") {
      return (
        <>
          <h4 className="font-semibold text-gray-800">No Organization Joined</h4>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you're not part of any organization yet. Join now to get started.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/home/join")}
              className="px-5 py-2 rounded-xl bg-[#23358B] text-white hover:opacity-90"
            >
              JOIN
            </button>
          </div>
        </>
      );
    }

    if (filter === "created") {
      return (
        <>
          <h4 className="font-semibold text-gray-800">No Created Organization Found</h4>
          <p className="mt-1 text-sm text-gray-500">
            You haven’t set up an organization yet. Click create to start.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/home/new")}
              className="px-5 py-2 rounded-xl bg-[#23358B] text-white hover:opacity-90"
            >
              CREATE
            </button>
          </div>
        </>
      );
    }

    if (filter === "pending") {
      return (
        <>
          <h4 className="font-semibold text-gray-800">No Pending Requests</h4>
          <p className="mt-1 text-sm text-gray-500">
            You don’t have any pending join requests. Try joining an organization to see it here.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/home/join")}
              className="px-5 py-2 rounded-xl bg-[#23358B] text-white hover:opacity-90"
            >
              JOIN ORGANIZATION
            </button>
          </div>
        </>
      );
    }


    // Default (All)
    return (
      <>
        <h4 className="font-semibold text-gray-800">No Organization Found</h4>
        <p className="mt-1 text-sm text-gray-500">
          To access features, join an existing organization or create a new one.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/home/join")}
            className="px-5 py-2 rounded-xl bg-[#23358B] text-white hover:opacity-90"
          >
            JOIN
          </button>
          <span className="text-sm text-gray-400">or</span>
          <button
            onClick={() => navigate("/home/new")}
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            CREATE
          </button>
        </div>
      </>
    );
  };

  return (
    <section className="bg-gray-50 min-h-screen flex flex-col justify-between">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>

        <div className="flex items-center gap-2 text-[#23358B] font-medium">
          <span>User</span>
          <UserIcon className="w-5 h-5" />
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="flex flex-col items-center px-6 py-10 w-full">
        <div className=" w-full max-w-5xl">
          {/* Judul */}
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Your Organization
            </h1>

            <button
              onClick={() => navigate("/organizations/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#23358B] text-white rounded-xl hover:opacity-90"
            >
              Create New Organization <Plus size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            List of your currently joined &amp; created organizations
          </p>

          {/* Filter dan search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white border rounded-xl text-sm w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="joined">Joined</option>
              <option value="created">Created</option>
              <option value="pending">Pending</option>
            </select>

            <div className="relative flex-1 w-full sm:max-w-xl">
              <input
                type="text"
                placeholder="Search organization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white border rounded-xl text-sm outline-none"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Empty state */}
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="max-w-md mx-auto">{renderEmptyState()}</div>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-white text-center py-6 text-xs text-neutral-500 border-t">
        © 2025 SIKOMA. Simplify, track and connect with SIKOMA
      </footer>
    </section>
  );
}
