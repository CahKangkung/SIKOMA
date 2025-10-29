import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User as UserIcon } from "lucide-react";

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validasi input
    if (!name.trim()) return setError("Organization name is required.");
    if (name.trim().length < 3)
      return setError("Organization name must be at least 3 characters.");

    try {
      setSubmitting(true);
      // Simulasi submit data
      await new Promise((r) => setTimeout(r, 1000));
      navigate("/organizations/current");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen flex flex-col justify-between bg-gray-50">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        {/* Tombol Return */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#23358B] hover:underline"
        >
          <ChevronLeft size={18} /> Return
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 text-[#23358B] font-medium">
          <span>User</span>
          <UserIcon className="w-5 h-5" />
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="flex flex-col items-center px-6 py-10 bg-grey-200">
        {/* Judul Halaman */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Create Organization
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg flex flex-col gap-5"
        >
          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Input: Organization Name */}
          <div className="text-left">
            <label
              htmlFor="orgName"
              className="block text-sm font-semibold text-gray-800 mb-1"
            >
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B]"
            />
          </div>

          {/* Input: Description */}
          <div className="text-left">
            <label
              htmlFor="orgDesc"
              className="block text-sm font-semibold text-gray-800 mb-1"
            >
              Organization Description
            </label>
            <textarea
              id="orgDesc"
              rows={5}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-white w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#23358B] resize-none"
            />
          </div>

          {/* Tombol Submit kanan bawah */}
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

      {/* ===== Footer ===== */}
      <footer className="bg-white text-center py-6 text-xs text-neutral-500 border-t">
        © 2025 SIKOMA. Simplify, track and connect with SIKOMA
      </footer>
    </section>
  );
}
