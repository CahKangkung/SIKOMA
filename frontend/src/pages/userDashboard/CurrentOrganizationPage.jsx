import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Plus, Search, ChevronLeft, User as UserIcon, IdCard, LogOut } from "lucide-react";

export default function CurrentOrganizationsPage() {
  const { user, loading, clearUser } = useUser();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingPage, setLoadingPage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // const [orgList, setOrgList] = useState([]);

  const [allOrgs, setAllOrgs] = useState([]);
  const [createdOrgs, setCreatedOrgs] = useState([]);
  const [joinedOrgs, setJoinedOrgs] = useState([]); 
  const [pendingOrgs, setPendingOrgs] = useState([]); 

  // Ambil organisasi yang dimiliki user
  useEffect(() => {
    if (loading) return; 
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchMyOrgs = async () => {
      try {
        setLoadingPage(true);
        const res = await fetch("http://localhost:8080/api/organization/my", {
          credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
          setAllOrgs(data.all || []);
          setCreatedOrgs(data.created || []);
          setJoinedOrgs(data.joined || []);
          setPendingOrgs(data.pending || []);        
        } else {
          throw new Error(`Failed to load organization: ${data.message}`);
        }
      } catch (err) {
        console.error("Error fetching organization: ", err);
      } finally {
        setLoadingPage(false);
      }
    }

    fetchMyOrgs();
  }, [user, loading, navigate]);
  // }, [user]);

  // Cancel request join user
  const cancelReqOrg = async (orgId, orgName) => {
    if (!confirm(`Cancel request to join "${orgName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/organization/${orgId}/cancel`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        setPendingOrgs(pendingOrgs.filter((o) => o._id !== orgId));
        setAllOrgs(allOrgs.filter((o) => o._id !== orgId));
        alert(`Request to join "${orgName}" has been cancelled`);
      } else {
        console.error("Failed to cancel request: ", data.message);
      }
    } catch (err) {
      console.error("Error canceling request: ", err);
      alert(err.message);
    }
  };

  // Filter organisasi user
  const filteredOrgs = () => {
    let orgs = [];

    switch (filter) {
      case "created":
        orgs = createdOrgs.map((org) => ({ ...org, status: "created" }));
        break;
      case "joined":
        orgs = joinedOrgs.map((org) => ({ ...org, status: "joined" }));
        break;
      case "pending":
        orgs = pendingOrgs.map((org) => ({ ...org, status: "pending" }));
        break;
      default: 
        orgs = [
          ...createdOrgs.map((org) => ({ ...org, status: "created" })),
          ...joinedOrgs.map((org) => ({ ...org, status: "joined" })),
          ...pendingOrgs.map((org) => ({ ...org, status: "pending" }))
        ];
    }

    if (search.trim()) {
      orgs = orgs.filter((org) => org.name.toLowerCase().includes(search.toLowerCase().trim()));
    }

    return orgs;
  };

  const filtered = filteredOrgs();

  // Tampilan kosong
  const renderEmptyState = () => {
    if (filter === "joined") {
      return (
        <>
          <h4 className="font-semibold text-gray-800">
            No Joined Organization Found
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            You haven’t joined any organization yet. Try joining one below.
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
          <h4 className="font-semibold text-gray-800">
            No Created Organization Found
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            You haven’t created an organization yet.
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
            You currently have no pending join requests.
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

    return (
      <>
        <h4 className="font-semibold text-gray-800">No Organizations Found</h4>
        <p className="mt-1 text-sm text-gray-500">
          Join or create an organization to get started.
        </p>
        <div className="mt-6 flex justify-center gap-4">
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

  useEffect(() => {
      const onClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      };
      const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }, []);
  
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

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
    <section className="bg-gray-50 min-h-screen flex flex-col justify-between">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white relative z-50" style={{ position: "sticky", top: "0" }}>
        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <span>{user?.username || "User"}</span>
            <UserIcon className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-neutral-900 text-white shadow-2xl ring-1 ring-black/10 z-50"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800"
              >
                <IdCard className="h-5 w-5 text-white/80" />
                <span>Account Detail</span>
              </button>
              <div className="h-px bg-white/10" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="flex flex-col items-center px-6 py-10 w-full">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Your Organizations
            </h1>
            <button
              onClick={() => navigate("/home/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#23358B] text-white rounded-xl hover:opacity-90"
            >
              Create New Organization <Plus size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            List of your created, joined, and pending organizations
          </p>

          {/* Filter dan search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white border rounded-xl text-sm w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="created">Created</option>
              <option value="joined">Joined</option>
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

          {/* ===== List or Empty State ===== */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((org) => {
                const userId = user.id || user._id;
                const isCreator = org.createdBy?._id === userId;

                return (
                  <div
                    key={org._id}
                    className="flex justify-between items-center bg-white rounded-xl shadow p-4 border hover:shadow-md transition"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800 uppercase">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isCreator ? "Author: You" : `Author: ${org.createdBy?.username || "Unknown"}`}
                      </p>
                      <span
                        className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                          org.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : org.status === "joined"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {org.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {org.status === "pending" && (
                      <>
                        <div>                          
                          <span className="text-yellow-600 text-sm font-semibold">
                              ⌛ Waiting for approval
                          </span>
                          <button
                            onClick={() => cancelReqOrg(org._id, org.name)}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            style={{ marginLeft: "10px" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}

                    {org.status !== "pending" && (
                      <button
                        onClick={() =>
                          navigate(`/${org._id}/dashboard`, {
                            state: { organization: org },
                          })
                        }
                        className="px-4 py-2 rounded-lg bg-[#23358B] text-white hover:opacity-90"
                      >
                        Enter
                      </button>
                    )}
                  </div>
                );
              })}                            
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
              <div className="max-w-md mx-auto">{renderEmptyState()}</div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white text-center py-6 text-xs text-neutral-500 border-t">
        © 2025 SIKOMA. Simplify, track and connect with SIKOMA
      </footer>
    </section>
  );
}
