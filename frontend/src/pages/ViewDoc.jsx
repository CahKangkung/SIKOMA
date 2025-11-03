// src/pages/ViewDoc.jsx
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, deleteDoc, replaceDocFile, updateDoc } from "../Services/api";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  Trash2,
  Download,
  CheckCircle2,
  UploadCloud,
  Cog,
  XCircle,              // ⬅️ tambah ikon X
} from "lucide-react";

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

/* Step with dynamic color */
function Step({ icon, label, active, color = "blue" }) {
  const ring = {
    blue: "border-blue-300 bg-blue-200 text-blue-800",
    yellow: "border-yellow-300 bg-yellow-200 text-yellow-800",
    green: "border-green-300 bg-green-200 text-green-800",
    rose: "border-rose-300 bg-rose-200 text-rose-800",
    gray: "border-gray-200 bg-gray-100 text-gray-400",
  };
  const text = {
    blue: "text-blue-800",
    yellow: "text-yellow-800",
    green: "text-green-800",
    rose: "text-rose-800",
    gray: "text-gray-400",
  };

  const ringCls = active ? ring[color] : ring.gray;
  const textCls = active ? text[color] : text.gray;

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`grid h-24 w-24 place-content-center rounded-full border-8 ${ringCls}`}>
        {icon}
      </div>
      <div className={`mt-3 text-lg font-semibold ${textCls}`}>{label}</div>
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

  // lock submit saat proses
  const [saving, setSaving] = useState(false);

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

  // Submit: update ke DB, lalu refresh UI dari respons server
  const submitAction = async (e) => {
    e.preventDefault();
    if (!doc || saving) return;

    try {
      setSaving(true);
      const status = (actionStatus && canon(actionStatus)) || "On Review";

      if (status === "Approved") {
        if (!approvalFile) {
          alert("Saat Approved, wajib unggah dokumen pengganti.");
          return;
        }

        // 1) upload file and get response (file metadata or updated doc)
        const replaceResp = await replaceDocFile(doc._id || doc.id, approvalFile);
        // replaceResp should include new fileId or updated document; adjust according to your API

        // 2) update status (include fileId if backend needs it)
        const payload = { status: "Approved" };
        if (replaceResp?.fileId) payload.fileId = replaceResp.fileId;
        const updated = await updateDoc(doc._id || doc.id, payload);

        setDoc(updated || replaceResp || doc);
      } else if (status === "Reject") {
        const updated = await updateDoc(doc._id || doc.id, {
          status: "Reject",
          comment: (comment || "").trim(),
        });
        setDoc(updated);
      } else {
        const updated = await updateDoc(doc._id || doc.id, { status: "On Review" });
        setDoc(updated);
      }

      setActionStatus(nextActionFromStatus(canon((doc?.status))));
      setComment("");
      setApprovalFile(null);

      await load();
      localStorage.setItem("needsReloadDocs", "1");
      alert("Status berhasil diperbarui.");
    } catch (e2) {
      console.error(e2);
      alert("Gagal menyimpan status: " + (e2?.message || ""));
    } finally {
      setSaving(false);
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
                  disabled={saving}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-white ${
                    saving
                      ? "bg-rose-300 cursor-not-allowed"
                      : "bg-rose-500/90 hover:bg-rose-600"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {/* Stepper dengan warna dinamis */}
              <div className="rounded-2xl bg-indigo-50/40 p-6">
                <div className="flex items-center justify-center gap-16">
                  {(() => {
                    const s = canon(doc?.status); // "Uploaded" | "On Review" | "Approved" | "Reject"

                    // 1) Uploaded → biru (active)
                    const uploaded = {
                      label: "Uploaded",
                      icon: <UploadCloud className="h-8 w-8" />,
                      active: true,
                      color: "blue",
                    };

                    // 2) On Review → kuning (active kalau status >= on review)
                    const onReview = {
                      label: "On Review",
                      icon: <Cog className="h-8 w-8" />,
                      active: s === "On Review" || s === "Approved" || s === "Reject",
                      color: "yellow",
                    };

                    // 3) Final step: Approved (hijau) atau Rejected (merah)
                    const isRejected = s === "Reject";
                    const final = isRejected
                      ? {
                          label: "Rejected",
                          icon: <XCircle className="h-8 w-8" />,
                          active: true,
                          color: "rose",
                        }
                      : {
                          label: "Approved",
                          icon: <CheckCircle2 className="h-8 w-8" />,
                          active: s === "Approved",
                          color: "green",
                        };

                    // Render 3 step berurutan
                    return (
                      <>
                        <Step {...uploaded} />
                        <Step {...onReview} />
                        <Step {...final} />
                      </>
                    );
                  })()}
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
                  <Meta label="Due Date" value={doc.due} alignRight />
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
              <form
                onSubmit={submitAction}
                onKeyDown={(e) => {
                  if (saving && e.key === "Enter") e.preventDefault();
                }}
                className="mt-10"
              >
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
                      disabled={saving}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                    >
                      <option>On Review</option>
                      <option>Approved</option>
                      <option>Reject</option>
                    </select>
                  </div>

                  {actionStatus === "Approved" && (
                    <div>
                      <div className="font-semibold text-[#23358B]">Upload Document</div>
                      <label
                        className={`mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-8 text-center hover:bg-indigo-50 ${
                          saving ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setApprovalFile(e.target.files?.[0] || null)}
                          disabled={saving}
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
                        disabled={saving}
                        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    aria-disabled={saving}
                    className={`rounded-xl px-8 py-3 text-white font-semibold transition ${
                      saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#133962] hover:opacity-90"
                    }`}
                  >
                    {saving ? "Submitting…" : "Submit"}
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
