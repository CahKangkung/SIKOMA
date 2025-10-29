// src/pages/AddDoc.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { upload, summarizePreview } from "../Services/api";
import Sidebar from "../components/Sidebar";
import { ArrowLeft } from "lucide-react";

const RECIPIENTS = [
  "UKM Seni Rupa",
  "Himpunan Mahasiswa SI",
  "UKM Robotika",
  "BEM Fakultas",
];

export default function AddDoc() {
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("");
  const [due, setDue] = useState(""); // YYYY-MM-DD
  const [file, setFile] = useState(null);

  const [notes, setNotes] = useState("");     // preview summary (Generate with AI)
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const doSummarize = async () => {
    if (!file) return alert("Pilih file terlebih dahulu.");
    try {
      setLoadingAI(true);
      const fd = new FormData();
      fd.append("file", file);
      const data = await summarizePreview(fd); // { summary }
      setNotes(data.summary || "");
    } catch (e) {
      console.error(e);
      alert("Gagal generate ringkasan.");
    } finally {
      setLoadingAI(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Isi Document Title.");
    if (!file) return alert("Silakan unggah file.");
    if (!recipient) return alert("Pilih recipient.");
    if (!due) return alert("Isi Due Date.");

    try {
      setSubmitting(true);

      // tanggal upload (hari ini)
      const uploadDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const fd = new FormData();
      fd.append("file", file);
      fd.append("subject", title.trim());
      fd.append("author", recipient);
      fd.append("date", uploadDate);           // upload date
      fd.append("dueDate", due);               // due date tersendiri
      fd.append("status", "Uploaded");         // ← penting: status awal "Uploaded"
      fd.append("comment", "")
      // notes opsional – kalau mau ikut dikirim:
      if (notes?.trim()) fd.append("notes", notes.trim());

      await upload(fd);

      alert("Dokumen tersimpan!");
      navigate("/manage-document");
    } catch (e2) {
      console.error(e2);
      alert("Gagal submit dokumen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage="Manage Document" />

      <div className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <h1 className="text-2xl font-bold text-[#23358B]">Add Document</h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Title row */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-[#23358B] hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Add New Document</span>
          </button>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Document Title */}
            <div>
              <label className="block text-sm font-semibold text-[#23358B]">
                Document Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mis. Proposal Pasar Seni"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Notes + Generate with AI */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#23358B]">
                  Notes
                </label>
                <button
                  type="button"
                  onClick={doSummarize}
                  disabled={loadingAI || !file}
                  className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {loadingAI ? "Generating…" : "Generate  with AI"}
                </button>
              </div>
              <textarea
                rows={6}
                placeholder="Tambahkan ringkasan/notes (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Dropzone */}
            <div>
              <label className="block text-sm font-semibold text-[#23358B] mb-2">
                Upload Document
              </label>
              <label
                className="block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-10 text-center hover:bg-indigo-50"
              >
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  className="hidden"
                  onChange={onPickFile}
                />
                <div className="text-6xl">🗂️</div>
                <div className="mt-3 text-gray-600">
                  Drag your file(s) to start uploading
                </div>
                <div className="text-gray-500 text-sm mt-1">OR</div>
                <div className="mt-2 inline-block rounded-lg border border-indigo-300 px-4 py-1.5 text-indigo-700">
                  Browse files
                </div>
                {file && (
                  <div className="mt-4 text-sm text-gray-700">
                    Selected: <b>{file.name}</b>
                  </div>
                )}
              </label>
            </div>

            {/* Recipient & Due Date */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#23358B]">
                  Recipient
                </label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="" disabled>
                    Please choose the recipient
                  </option>
                  {RECIPIENTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#23358B]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#133962] px-8 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
