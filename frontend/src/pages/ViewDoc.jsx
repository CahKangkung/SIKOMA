// src/pages/ViewDoc.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, deleteDoc, updateDoc /*, approveWithFile*/ } from "../Services/api";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Trash2, Download, CheckCircle2, UploadCloud, Cog } from "lucide-react";

export default function ViewDoc() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form aksi
  const [actionStatus, setActionStatus] = useState("On Review");
  const [comment, setComment] = useState("");
  const [approvalFile, setApprovalFile] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE;

  // util konversi status UI → server
  const toServerStatus = (ui) => {
    if (ui === "Approve" || ui === "Approved") return "approved";
    if (ui === "Reject" || ui === "Rejected") return "rejected";
    return "on_review";
  };
  // util konversi server → label cantik
  const prettyStatus = (s) => {
    if (!s) return "On Review";
    const key = String(s).toLowerCase();
    if (key === "approved") return "Approved";
    if (key === "rejected") return "Rejected";
    return "On Review";
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getDoc(id);
      setDoc(data);
      setActionStatus(prettyStatus(data?.status));
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

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
    const s = prettyStatus(doc?.status);
    if (s === "Approved") return 2;
    if (s === "On Review") return 1;
    return 0; // Uploaded
  }, [doc]);

  const submitAction = async (e) => {
    e.preventDefault();

    const serverStatus = toServerStatus(actionStatus);
    try {
      const payload = { status: serverStatus };
      if (serverStatus === "rejected" && comment?.trim()) {
        payload.reviewerComment = comment.trim();
      }

      // Jika perlu upload file approval:
      // if (serverStatus === "approved" && approvalFile) {
      //   await approveWithFile(doc._id || doc.id, approvalFile);
      // } else {
      //   await updateDoc(doc._id || doc.id, payload);
      // }
      await updateDoc(doc._id || doc.id, payload);

      // update UI lokal → stepper & label berubah
      setDoc((prev) => ({ ...prev, status: serverStatus }));
      setActionStatus(prettyStatus(serverStatus));
      setComment("");
      setApprovalFile(null);

      navigate("/manage-document");
    } catch (error) {
      console.error("update error:", error?.response || error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Gagal menyimpan status.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage="Manage Document" />
      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 border-b bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <h1 className="text-2xl font-bold text-[#23358B]">View Document</h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">
          {loading && <div className="text-gray-500">Loading…</div>}
          {err && <div className="text-rose-600">{err}</div>}

          {!loading && !err && doc && (
            <>
              {/* Header row + delete */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-[#23358B] hover:opacity-80"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-lg font-semibold">{doc.subject || "(tanpa subjek)"}</span>
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
              <div className="mt-6 rounded-2xl bg-indigo-50/40 p-6">
                <div className="flex items-center justify-center gap-16">
                  <Step icon={<UploadCloud className="h-8 w-8" />} label="Uploaded"  active={activeStepIndex >= 0} />
                  <Step icon={<Cog className="h-8 w-8" />}         label="On Review" active={activeStepIndex >= 1} />
                  <Step icon={<CheckCircle2 className="h-8 w-8" />} label="Approved"  active={activeStepIndex >= 2} />
                </div>
              </div>

              {/* Meta grid */}
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Meta label="Author" value={doc.author ?? "—"} />
                  <Meta label="Recipient" value={doc.recipient ?? "—"} />
                  <div className="mt-4">
                    <div className="font-semibold text-[#23358B]">Summary</div>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      {doc.summary?.trim()
                        ? doc.summary
                        : "Ringkasan belum tersedia untuk dokumen ini."}
                    </p>
                  </div>
                </div>

                <div>
                  <Meta label="Upload Date" value={doc.date ?? "—"} />
                  <Meta label="Due Date" value={doc.dueDate ?? "—"} />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-10">
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

              {/* ACTION AREA */}
              <form onSubmit={submitAction} className="mt-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Status select */}
                  <div>
                    <div className="font-semibold text-[#23358B]">Set Status</div>
                    <select
                      value={actionStatus}
                      onChange={(e) => {
                        setActionStatus(e.target.value);
                        setComment("");
                        setApprovalFile(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option>On Review</option>
                      <option>Approve</option>
                      <option>Reject</option>
                    </select>
                  </div>

                  {/* Conditional: Approve → upload file */}
                  {actionStatus === "Approve" && (
                    <div>
                      <div className="font-semibold text-[#23358B]">Upload Document</div>
                      <label className="mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-8 text-center hover:bg-indigo-50">
                        <input type="file" className="hidden" onChange={(e) => setApprovalFile(e.target.files?.[0] || null)} />
                        <div className="text-5xl">📥</div>
                        <div className="mt-1 text-sm text-gray-600">
                          Drag and drop atau klik untuk memilih file
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

                  {/* Conditional: Reject → add comment */}
                  {actionStatus === "Reject" && (
                    <div className="md:col-span-2">
                      <div className="font-semibold text-[#23358B]">Add Comment</div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Add your Comment"
                        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="submit" className="rounded-xl bg-[#133962] px-8 py-3 text-white font-semibold hover:opacity-90">
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

/* -------- small ui helpers -------- */

function Step({ icon, label, active }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`grid h-24 w-24 place-content-center rounded-full border-8 ${
          active ? "border-indigo-200 bg-indigo-100 text-indigo-700" : "border-gray-200 bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className={`mt-3 text-lg font-semibold ${active ? "text-indigo-700" : "text-gray-400"}`}>{label}</div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="mt-3">
      <div className="text-sm font-semibold text-[#23358B]">{label}</div>
      <div className="mt-1 text-gray-700">{value}</div>
    </div>
  );
}
