// src/pages/CreateOrganizationPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User as UserIcon } from "lucide-react";
import { organizations } from "../data/DummyData";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Organization name is required.");
    if (name.trim().length < 3)
      return setError("Organization name must be at least 3 characters.");

    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 1000));

      const newOrg = {
        id: Date.now(),
        name,
        authorId: currentUser?.id || 0,
        authorName: currentUser?.name || "Unknown",
        members: [currentUser?.id],
        description: desc,
      };

      const allOrgs = [...organizations, newOrg];
      localStorage.setItem("organizations", JSON.stringify(allOrgs));

      const myOrgs =
        JSON.parse(localStorage.getItem("myOrganizations") || "[]") || [];
      localStorage.setItem(
        "myOrganizations",
        JSON.stringify([...myOrgs, { ...newOrg, status: "active" }])
      );

      alert("Organization created successfully!");
      navigate("/home/current");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen flex flex-col justify-between bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>
        <div className="flex items-center gap-2 text-[#23358B] font-medium">
          <span>{currentUser?.name || "User"}</span>
          <UserIcon className="w-5 h-5" />
        </div>
      </header>

      <main className="flex flex-col items-center px-6 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Create Organization
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-5">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Description
            </label>
            <textarea
              rows={5}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B] resize-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#23358B] text-white px-5 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}
