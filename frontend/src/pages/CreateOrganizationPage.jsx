import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import { ChevronLeft } from "lucide-react";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // validasi sederhana
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }
    if (name.trim().length < 3) {
      setError("Organization name must be at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);

      // TODO: ganti endpoint sesuai backend kamu
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create organization");
      }

      // selesai → balik ke daftar organisasi (atau ke org current)
      navigate("/organizations?mode=current");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Create Organization" />

        <main className="p-8">
          {/* Return link */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
          >
            <ChevronLeft size={18} /> Return
          </button>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Create Organization
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-2xl space-y-5 bg-white p-6 rounded-2xl border"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-gray-700"
              >
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:border-[#23358B]"
                placeholder="ex: Sistem Informasi Fakultas"
              />
            </div>

            <div>
              <label
                htmlFor="orgDesc"
                className="block text-sm font-medium text-gray-700"
              >
                Organization Description
              </label>
              <textarea
                id="orgDesc"
                rows={6}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:border-[#23358B] resize-y"
                placeholder="Deskripsi singkat organisasi…"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-[#23358B] px-5 py-2 text-white shadow hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>

          <footer className="text-center py-6 text-sm text-neutral-500">
            © 2025 SIKOMA. Simplify, track and connect with SIKOMA
          </footer>
        </main>
      </div>
    </div>
  );
}
