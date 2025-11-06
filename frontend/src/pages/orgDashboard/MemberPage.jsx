// src/pages/MemberPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Trash2, Check, X } from "lucide-react";
import { users, organizations, joinRequests } from "../../data/DummyData";

export default function MemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [org, setOrg] = useState("");
  const [member, setMember] = useState([]);
  const [request, setRequest] = useState([]);
  const [message, setMessage] = useState(""); 
  const [loadingData, setLoadingData] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // const userId = user.id || user._id
  const userId = user ? (user.id || user._id) : null;
  const isCreator = user && org && String(userId) === String(org.createdBy?._id);
  // const isCreator = user && org && 
  //   (String(user.id) === String(org.createdBy?._id) || 
  //    String(user._id) === String(org.createdBy?._id));

  const fetchMember = async () => {
    try {
      // const [memberOrg, requestOrg] = await Promise.all([
      //   fetch(`http://localhost:8080/api/organization/${id}/members`, {
      //     credentials: "include"
      //   }),
      //   fetch(`http://localhost:8080/api/organization/${id}/requests`, {
      //     credentials: "include"
      //   })
      // ]);

      setLoadingData(true);

      const memberOrg = await fetch(`http://localhost:8080/api/organization/${id}/members`, {
        credentials: "include"
      });

      if (!memberOrg.ok) {
        throw new Error("Failed to fetch members");
      }

      const membersData = await memberOrg.json();
      // const requestData = await requestOrg.json();

      setOrg(membersData);
      setMember(membersData.members || []);
      // setRequest(requestData || []);      

      if (user && membersData.createdBy && String(userId) === String(membersData.createdBy._id)) {
      // if (user && membersData.createdBy && 
      //     (String(user.id) === String(membersData.createdBy._id) || 
      //      String(user._id) === String(membersData.createdBy._id))) {
        try {
          const requestOrg = await fetch(`http://localhost:8080/api/organization/${id}/requests`, {
            credentials: "include"
          });

          const requestData = await requestOrg.json();

          console.log("📦 Request Data:", requestData);

          if (requestOrg.ok) {
            setRequest(Array.isArray(requestData) ? requestData : [])
          } else {
            setRequest([]);
          }
        } catch (err) {
          console.log("Cannot fetch requests (not authorized):", err);
          setRequest([]);
        }
      } else {
        setRequest([]);
      }

    } catch (err) {
      console.error("Error fetching member: ", err);
      setMessage("❌ Failed to load member data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    fetchMember();
  }, [id, user, loading]);

  const approveUser = async (userIdRequest) => {
    try {
      const res = await fetch(`http://localhost:8080/api/organization/${id}/approve/${userIdRequest}`, {
          method: "POST",
          credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
          setMessage("✅ User approved successfully!");
          fetchMember();
      } else {
          setMessage("❌ " + (data.error || "Failed to approve user"));
      }
    } catch (err) {
      setMessage("❌ Error approving user");
    }      
  };

  const rejectUser = async (userIdRequest) => {
    try {
      const res = await fetch(`http://localhost:8080/api/organization/${id}/reject/${userIdRequest}`, {
          method: "POST",
          credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
          setMessage("🚫 User rejected successfully!");
          fetchMember();
      } else {
          setMessage("❌ " + (data.error || "Failed to reject user"));
      }
    } catch (err) {
      setMessage("❌ Error rejecting user");
    }        
  };

  const handleKickUser = async (memberId) => {
      // if (!window.confirm("Are you sure you want to remove this member?")) return;
      try {
          const res = await fetch(`http://localhost:8080/api/organization/${id}/members/${memberId}`, {
              method: "DELETE",
              headers: {
                  // Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",                    
              }, 
              credentials: "include"
          });

          const data = await res.json();

          if (res.ok) {
              // alert("Member removed successfully");
              setMessage("🗑️ Member removed successfully!");
              setMember(data.members);
              fetchMember();
          } else {
              setMessage(`❌ Failed to remove member: ${data.error}`);
          }
      } catch (err) {
          setMessage(`❌ Error removing member`);
      }
  };

  const transferOwner = async (memberId) => {
      const confirmation = prompt("Type 'confirm' to transfer ownership");

      if (confirmation?.toLowerCase() !== "confirm") {
          alert("Transfer canceled");
          return;
      }

      try {
          const res = await fetch(`http://localhost:8080/api/organization/${id}/transfer/${memberId}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",                    
              },
              credentials: "include",
              body: JSON.stringify({ confirmation })
          });

          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.error || "Failed to transfer ownership: ");
          }

          // alert("✅ Ownership successfully transferred!");
          setMessage("✅ Ownership successfully transferred!");
          fetchMember();
          // window.location.reload();

      } catch (err) {
          alert(`Error: ${err.message}`);
      }
  };

  // Ambil user aktif dari localStorage
  // const currentUser =
  //   JSON.parse(localStorage.getItem("currentUser")) || users[0];

  // Ambil organisasi aktif milik user (sebagai admin)
  // const activeOrg =
  //   organizations.find((org) => org.authorId === currentUser.id) ||
  //   organizations.find((org) =>
  //     org.members.some(
  //       (member) => member.id === currentUser.id && member.role === "Admin"
  //     )
  //   ) ||
  //   organizations[4]; // fallback

  // const currentMembers = activeOrg?.members || [];
  const filteredRequests = request.filter((r) =>
    (r.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = member.filter((m) =>
    (m.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );  

  // === Popup Confirmation ===
  const handleConfirm = (member, action) => {
    setSelectedMember(member);
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const handleProceed = () => {
    if (!selectedMember || !confirmAction) return;

    // if (confirmAction === "makeAdmin") {
    //   alert(`✅ ${selectedMember.name} has been promoted to Admin.`);
    // } else if (confirmAction === "delete") {
    //   alert(`🗑️ ${selectedMember.name} has been removed from the organization.`);
    // } else if (confirmAction === "acceptRequest") {
    //   alert(`✅ ${selectedMember.name}'s membership request has been accepted.`);
    // } else if (confirmAction === "rejectRequest") {
    //   alert(`❌ ${selectedMember.name}'s membership request has been rejected.`);
    // }

    if (confirmAction === "delete") {
      handleKickUser(selectedMember.user._id);
    } else if (confirmAction === "makeAdmin") {
      transferOwner(selectedMember.user._id);
    }

    setShowConfirm(false);
    setSelectedMember(null);
    setConfirmAction(null);
  };

  // ✅ Loading state
  if (loading || loadingData) {
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
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar tetap fix */}
      <Sidebar />

      {/* Wrapper konten utama */}
      <div className="flex-1 ml-64 flex flex-col relative z-0 bg-[#F8FAFC]">
        <Header title="Member" />

        {/* Area scrollable konten */}
        <main className="p-10 flex-1 overflow-y-auto bg-[#F8FAFC] relative z-10 h-[calc(100vh-64px)] space-y-8">
          {/* Message Feedback */}
          {message && (
            <div className={`p-4 rounded-md ${message.includes("❌") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message}
              <button 
                onClick={() => setMessage("")}
                className="ml-4"
              >
                X
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for something"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#23358B] outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* CURRENT MEMBERS */}
          <section>
            <h3 className="text-lg font-semibold text-[#23358B] mb-4">
              Current Members ({filteredMembers.length})
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[#23358B] border-b">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Name</th>
                    <th className="py-3 px-6 font-semibold">Email</th>
                    <th className="py-3 px-6 font-semibold">Role</th>
                    <th className="py-3 px-6 font-semibold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    [...filteredMembers].sort((a, b) => {
                      const order = { admin: 1, member: 2};
                      return order[a.role] - order[b.role];
                    }).map((m) => (
                      <tr
                        key={m.user._id}
                        className="border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <td className="py-3 px-6">{m.user.username}</td>
                        <td className="py-3 px-6">{m.user.email}</td>
                        {/* Ganti tampilan Owner jadi Admin */}
                        <td className="py-3 px-6">
                          {m.role === "Owner" ? "Admin" : m.role}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {/* Admin tidak bisa dihapus */}
                          {isCreator && m.role !== "admin" ? (
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleConfirm(m, "makeAdmin")}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                title="Transfer Admin"
                              >
                                <ShieldCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleConfirm(m, "delete")}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                                title="Remove member"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">No actions</span>
                          )}                        
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-4">
                        No members found.
                      </td>
                    </tr>                  
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* MEMBERSHIP REQUEST */}
          { isCreator && (
          <section>
            <h3 className="text-lg font-semibold text-[#23358B] mb-4">
              Membership Request ({filteredRequests.length})
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[#23358B] border-b">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Name</th>
                    <th className="py-3 px-6 font-semibold">Email</th>
                    <th className="py-3 px-6 font-semibold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) =>                      
                      (
                        <tr
                          key={req.user._id}
                          className="border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          <td className="py-3 px-6">{req.user.username}</td>
                          <td className="py-3 px-6">{req.user.email}</td>
                          <td className="py-3 px-6 text-center flex justify-center gap-3">
                            <button
                              onClick={() =>
                                approveUser(req.user._id)
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition"
                              title="Accept"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                rejectUser(req.user._id)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-gray-500 py-4"
                      >
                        No pending requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          )}
        </main>
      </div>

      {/* === Popup Confirmation === */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold text-[#23358B] mb-4">
              Confirm Action
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <strong>
                {/* {confirmAction === "makeAdmin"
                  ? `promote ${selectedMember?.name} to Admin`
                  : confirmAction === "delete"
                  ? `remove ${selectedMember?.name}`
                  : confirmAction === "acceptRequest"
                  ? `accept ${selectedMember?.name}'s membership request`
                  : `reject ${selectedMember?.name}'s membership request`} */}
                  {confirmAction === "delete" ? 
                    `remove ${selectedMember?.user?.username}` : `transfer admin to ${selectedMember?.user?.username}`}
              </strong>
              ?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 rounded-md bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className={`px-6 py-2 rounded-md text-white font-semibold transition-all ${
                  confirmAction === "delete" 
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}