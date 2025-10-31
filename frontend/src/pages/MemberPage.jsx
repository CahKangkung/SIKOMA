import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, ShieldCheck, Trash2, Check, X } from "lucide-react";
import { users, organizations, joinRequests } from "../data/DummyData";

export default function MemberPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Ambil user aktif dari localStorage
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || users[0];

  // Ambil organisasi aktif milik user (sebagai admin)
  const activeOrg =
    organizations.find((org) => org.authorId === currentUser.id) ||
    organizations.find((org) =>
      org.members.some(
        (member) => member.id === currentUser.id && member.role === "Admin"
      )
    ) ||
    organizations[4]; // fallback

  const currentMembers = activeOrg?.members || [];
  const membershipRequests = joinRequests.filter(
    (req) => req.orgId === activeOrg.id && req.status === "pending"
  );

  const filteredMembers = currentMembers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === Popup Confirmation ===
  const handleConfirm = (member, action) => {
    setSelectedMember(member);
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const handleProceed = () => {
    if (!selectedMember || !confirmAction) return;

    if (confirmAction === "makeAdmin") {
      alert(`✅ ${selectedMember.name} has been promoted to Admin.`);
    } else if (confirmAction === "delete") {
      alert(`🗑️ ${selectedMember.name} has been removed from the organization.`);
    } else if (confirmAction === "acceptRequest") {
      alert(`✅ ${selectedMember.name}'s membership request has been accepted.`);
    } else if (confirmAction === "rejectRequest") {
      alert(`❌ ${selectedMember.name}'s membership request has been rejected.`);
    }

    setShowConfirm(false);
    setSelectedMember(null);
    setConfirmAction(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar tetap fix */}
      <Sidebar />

      {/* Wrapper konten utama */}
      <div className="flex-1 ml-64 flex flex-col relative z-0 bg-[#F8FAFC]">
        <Header title="Member" />

        {/* Area scrollable konten */}
        <main className="p-10 flex-1 overflow-y-auto bg-[#F8FAFC] relative z-10 h-[calc(100vh-64px)] space-y-8">
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
              Current Member
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
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <td className="py-3 px-6">{member.name}</td>
                      <td className="py-3 px-6">{member.email}</td>
                      {/* Ganti tampilan Owner jadi Admin */}
                      <td className="py-3 px-6">
                        {member.role === "Owner" ? "Admin" : member.role}
                      </td>
                      <td className="py-3 px-6 text-center">
                        {/* Admin tidak bisa dihapus */}
                        {member.role === "Owner" || member.role === "Admin" ? (
                          <span className="text-gray-400 text-sm italic">
                            No actions
                          </span>
                        ) : (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() =>
                                handleConfirm(member, "makeAdmin")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition"
                              title="Make Admin"
                            >
                              <ShieldCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleConfirm(member, "delete")}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                              title="Remove member"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-500 py-4"
                      >
                        No members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* MEMBERSHIP REQUEST */}
          <section>
            <h3 className="text-lg font-semibold text-[#23358B] mb-4">
              Membership Request
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
                  {membershipRequests.length > 0 ? (
                    membershipRequests.map((req) => {
                      const user = users.find((u) => u.id === req.userId);
                      const displayUser = {
                        name: user?.name || req.userName,
                        email: user?.email || "-",
                      };
                      return (
                        <tr
                          key={req.requestId}
                          className="border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          <td className="py-3 px-6">{displayUser.name}</td>
                          <td className="py-3 px-6">{displayUser.email}</td>
                          <td className="py-3 px-6 text-center flex justify-center gap-3">
                            <button
                              onClick={() =>
                                handleConfirm(displayUser, "acceptRequest")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition"
                              title="Accept"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleConfirm(displayUser, "rejectRequest")
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                {confirmAction === "makeAdmin"
                  ? `promote ${selectedMember?.name} to Admin`
                  : confirmAction === "delete"
                  ? `remove ${selectedMember?.name}`
                  : confirmAction === "acceptRequest"
                  ? `accept ${selectedMember?.name}'s membership request`
                  : `reject ${selectedMember?.name}'s membership request`}
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
                  confirmAction === "delete" || confirmAction === "rejectRequest"
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
