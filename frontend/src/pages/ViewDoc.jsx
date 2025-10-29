import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, deleteDoc, upload, updateDocStatus } from "../Services/api";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Trash2, Download, CheckCircle2, UploadCloud, Cog } from "lucide-react";

/* --- helpers --- */
const canon = (s) => {
  const k = String(s || "").toLowerCase().replace(/\s/g, "");
  if (k === "uploaded") return "Uploaded";
  if (k === "approved" || k === "approve") return "Approved";
  if (k === "reject" || k === "rejected") return "Reject";
  return "On Review";
};

// dropdown harus selalu punya value valid (tanpa "Uploaded")
const nextActionFromStatus = (canonStatus) => {
  if (canonStatus === "Uploaded") return "On Review";
  return canonStatus || "On Review";
};

function Step({ icon, label, active }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`grid h-24 w-24 place-content-center rounded-full border-8 ${
          active
            ? "border-indigo-200 bg-indigo-100 text-indigo-700"
            : "border-gray-200 bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className={`mt-3 text-lg font-semibold ${active ? "text-indigo-700" : "text-gray-400"}`}>
        {label}
      </div>
    </div>
  );
}

function Meta({ label, value, alignRight = false }) {
  return (
    <div className={`mt-3 ${alignRight ? "text-right" : ""}`}>
      <div className="text-sm font-semibold text-[#23358B]">{label}</div>
      <div className="mt-1 text-gray-700">{value ?? "—"}</div>
    </div>
  );
}

export default function ViewDoc() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state (tidak menulis ke DB sampai submit)
  const [actionStatus, setActionStatus] = useState(null);
  const [comment, setComment] = useState("");
  const [approvalFile, setApprovalFile] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const d = await getDoc(id);
      setDoc(d);
      const c = canon(d?.status);
      setActionStatus(nextActionFromStatus(c)); // dropdown default dari DB, tapi valid
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async () => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await deleteDoc(doc._id || doc.id);
      navigate("/manage-document");
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus dokumen.");
    }
  };

  const attach = doc?.attachments?.[0];
  const isPdf = attach?.mime === "application/pdf";
  const fileUrl = isPdf && attach ? `${apiBase}/files/${attach.fileId}` : null;

  const activeStepIndex = useMemo(() => {
    const s = canon(doc?.status);
    if (s === "Approved") return 2;
    if (s === "On Review") return 1;
    return 0; // Uploaded
  }, [doc]);

  // Submit: update ke DB, lalu refresh UI dari respons server
  const submitAction = async (e) => {
    e.preventDefault();
    if (!doc) return;

    try {
      const status = (actionStatus && canon(actionStatus)) || "On Review";
      const payload = { status };

      if (status === "Reject") {
        payload.comment = (comment || "").trim();
      }

      if (status === "Approved") {
        if (!approvalFile) {
          alert("Saat Approved, wajib unggah dokumen pengganti.");
          return;
        }
        const fd = new FormData();
        fd.append("file", approvalFile);
        const up = await upload(fd); // server mengembalikan fileId
        payload.approvalFileId = up?.fileId || up?.id;
      }

      // log dev (optional)
      // console.log("[ViewDoc] PATCH payload:", payload, "id:", (doc._id || doc.id));

      const updated = await updateDocStatus(doc._id || doc.id, payload);

      // segarkan tampilan berdasar data terbaru dari server
      setDoc(updated);
      setActionStatus(nextActionFromStatus(canon(updated?.status)));
      setComment("");
      setApprovalFile(null);

      // refresh penuh agar pasti sinkron dengan DB (stepper, preview)
      await load();

      // beri sinyal ke ManageDocs agar reload juga
      localStorage.setItem("needsReloadDocs", "1");

      alert("Status berhasil diperbarui.");
    } catch (e2) {
      console.error(e2);
      alert("Gagal menyimpan status.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage="Manage Document" />
      <div className="ml-64 min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 border-b bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <h1 className="text-2xl font-bold text-[#23358B]">View Document</h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">
          {loading && <div className="text-gray-500">Loading…</div>}
          {err && <div className="text-rose-600">{err}</div>}

          {!loading && !err && doc && (
            <>
              {/* Header row: back + title + delete */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-[#23358B] hover:opacity-80"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-lg font-semibold">
                    {doc.subject || "(tanpa subjek)"}
                  </span>
                </button>

                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-2 text-white hover:bg-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {/* Stepper */}
              <div className="rounded-2xl bg-indigo-50/40 p-6">
                <div className="flex items-center justify-center gap-16">
                  <Step icon={<UploadCloud className="h-8 w-8" />} label="Uploaded" active={activeStepIndex >= 0} />
                  <Step icon={<Cog className="h-8 w-8" />} label="On Review" active={activeStepIndex >= 1} />
                  <Step icon={<CheckCircle2 className="h-8 w-8" />} label="Approved" active={activeStepIndex >= 2} />
                </div>
              </div>

              {/* Meta kiri-kanan */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Meta label="Author" value={doc.author} />
                  <Meta label="Recipient" value={doc.recipient} />
                </div>
                <div>
                  <Meta label="Upload Date" value={doc.date} alignRight />
                  <Meta label="Due Date" value={doc.dueDate} alignRight />
                </div>
              </div>

              {/* Summary full width */}
              <div className="mt-6">
                <div className="font-semibold text-[#23358B]">Summary</div>
                <p className="mt-2 leading-relaxed text-gray-700">
                  {doc.summary?.trim()
                    ? doc.summary
                    : "Ringkasan belum tersedia untuk dokumen ini."}
                </p>
              </div>

              {/* Preview */}
              <div className="mt-8">
                <div className="mb-3 font-semibold text-[#23358B]">Preview</div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  {isPdf && fileUrl ? (
                    <div className="relative">
                      <a
                        href={fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-md bg-[#23358B] px-3 py-1.5 text-sm text-white hover:opacity-90"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                      <iframe title="PDF Preview" src={fileUrl} className="h-[540px] w-full rounded-md" />
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Preview tidak tersedia. {attach ? `(${attach.mime})` : "Tidak ada lampiran."}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION */}
              <form onSubmit={submitAction} className="mt-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="font-semibold text-[#23358B]">Set Status</div>
                    <select
                      value={actionStatus ?? "On Review"}
                      onChange={(e) => {
                        setActionStatus(e.target.value);
                        setComment("");
                        setApprovalFile(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option>On Review</option>
                      <option>Approved</option>
                      <option>Reject</option>
                    </select>
                  </div>

                  {actionStatus === "Approved" && (
                    <div>
                      <div className="font-semibold text-[#23358B]">Upload Document</div>
                      <label className="mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-8 text-center hover:bg-indigo-50">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setApprovalFile(e.target.files?.[0] || null)}
                        />
                        <div className="text-5xl">📥</div>
                        <div className="mt-1 text-sm text-gray-600">
                          Drag & drop atau klik untuk memilih file
                        </div>
                      </label>
                      {approvalFile && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                          <span className="text-lg">📄</span>
                          <span className="truncate">{approvalFile.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {actionStatus === "Reject" && (
                    <div className="md:col-span-2">
                      <div className="font-semibold text-[#23358B]">Add Comment</div>
                      <textarea
                        rows={4}
                        placeholder="Alasan penolakan"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#133962] px-8 py-3 text-white font-semibold hover:opacity-90"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
