import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { upload, summarizePreview } from "../Services/api";

const RECIPIENTS = [
  "UKM Seni Rupa",
  "Himpunan Mahasiswa SI",
  "UKM Robotika",
  "BEM Fakultas",
];

export default function AddDoc() {
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState(RECIPIENTS[0]);
  const [due, setDue] = useState(""); // YYYY-MM-DD
  const [file, setFile] = useState(null);

  const [notes, setNotes] = useState("");        // hasil “Generate with AI” (preview)
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // 3) Generate with AI → preview summary (tidak menyimpan)
  const doSummarize = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu.");
      return;
    }
    try {
      setLoadingAI(true);
      const fd = new FormData();
      fd.append("file", file);
      const data = await summarizePreview(fd); // { ok, summary, source }
      setNotes(data.summary || "");
    } catch (e) {
      console.error(e);
      alert("Gagal generate ringkasan.");
    } finally {
      setLoadingAI(false);
    }
  };

  // 4) Submit → simpan file + meta (+ server akan simpan summary final)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Isi Document Title.");
    if (!due) return alert("Isi Due Date.");
    if (!file) return alert("Silakan unggah file.");

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subject", title.trim());     // ⬅️ dipakai server sebagai subject
      fd.append("author", recipient);         // ⬅️ dipakai sebagai author (dummy)
      fd.append("date", due);                 // ⬅️ YYYY-MM-DD → tersimpan di DB
      fd.append("status", "On Review");       // ⬅️ dummy status

      const data = await upload(fd);          // server akan ringkas lagi & simpan
      console.log("Upload result:", data);
      // console.log("Upload result:", data);

      alert("Dokumen tersimpan!");
      navigate("/");
    } catch (e2) {
      console.error(e2);
      alert("Gagal submit dokumen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add Document</h2>

      <form onSubmit={onSubmit}>
        {/* 1) Title */}
        <div className="form-group">
          <label>Document Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mis. Proposal Pasar Seni"
          />
        </div>

        {/* 2) Input Doc */}
        <div className="dropzone">
          <input
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            onChange={onPickFile}
          />
          <div className="dz-hint">
            Drag your file(s) to start uploading
            <br />
            OR
            <br />
            <span className="browse">Browse files</span>
            {file && (
              <div className="picked">
                Selected: <b>{file.name}</b>
              </div>
            )}
          </div>

          {/* 3) Generate with AI */}
          <button
            type="button"
            className="btn-ghost"
            style={{ position: "absolute", right: 12, bottom: 12 }}
            onClick={doSummarize}
            disabled={loadingAI || !file}
          >
            {loadingAI ? "Generating…" : "Generate with AI"}
          </button>
        </div>

        {/* Notes (preview summary) */}
        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            rows={5}
            placeholder="Tambahkan catatan internal (tidak mempengaruhi upload)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* 1) Recipient & Due Date */}
        <div className="grid-2">
          <div className="form-group">
            <label>Recipient</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              {RECIPIENTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="yyyy-mm-dd"
            />
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
