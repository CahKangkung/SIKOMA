import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, deleteDoc } from "../Services/api";

export default function ViewDoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getDoc(id);
      setDoc(data);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]); // depend on id

  const onDelete = async () => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await deleteDoc(doc._id || doc.id);
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus dokumen.");
    }
  };

  const apiBase = import.meta.env.VITE_API_BASE;
  const attach = doc?.attachments?.[0];
  const isPdf = attach?.mime === "application/pdf";
  const fileUrl = isPdf && attach ? `${apiBase}/files/${attach.fileId}` : null;

  return (
    <div className="card">
      {loading && <div className="t-row muted">Loading…</div>}
      {err && <div className="t-row muted" style={{ color: "#b91c1c" }}>{err}</div>}

      {!loading && !err && doc && (
        <>
          <div className="toolbar-row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{doc.subject || "(tanpa subjek)"}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{doc.number} • {doc.date}</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={onDelete}>Hapus</button>
              <button className="btn-primary" onClick={() => navigate("/")}>Tutup</button>
            </div>
          </div>

          <div className="answer" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Ringkasan Dokumen</div>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {doc.summary?.trim() ? doc.summary : "Ringkasan belum tersedia untuk dokumen ini."}
            </pre>
          </div>

          {isPdf && fileUrl ? (
            <iframe title="PDF Preview" className="preview-frame" src={fileUrl} />
          ) : (
            <div className="answer">Preview tidak tersedia. {attach ? `(${attach.mime})` : "Tidak ada lampiran."}</div>
          )}
        </>
      )}
    </div>
  );
}
