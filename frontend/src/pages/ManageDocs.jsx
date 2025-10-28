import { useEffect, useState, useCallback } from "react";
import { listDocs, deleteDoc, search as searchApi } from "../Services/api";
import { useNavigate } from "react-router-dom";

const DUMMY_AUTHORS = ["UKM Seni Rupa", "Himpunan Mahasiswa SI", "UKM Robotika", "BEM Fakultas"];
const DUMMY_STATUS  = ["On Review", "Uploaded", "Rejected", "Approved"];

export default function ManageDocs() {
  const [docs, setDocs] = useState([]);           // daftar semua dokumen (untuk metadata)
  const [docMap, setDocMap] = useState({});       // id -> meta (cepat buat join)
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);           // hasil semantic search
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [threshold, setThreshold] = useState(0.75);
  const [topK, setTopK] = useState(8);

  const navigate = useNavigate();

  // --- STT (mic) opsional; tetap isi input & langsung cari
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const canMic = !!SR;
  const [listening, setListening] = useState(false);
  const startMic = () => {
    if (!canMic) return;
    const rec = new SR();
    rec.lang = "id-ID";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      const finalText = text.trim();
      setQ(finalText);
      if (finalText) runSearch(finalText); else clearSearch();
    };
    rec.start();
  };

  // --- muat daftar dokumen (untuk metadata di tabel hasil search)
  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const payload = await listDocs({ limit: 500 });
      const withDummy = (payload.items || []).map((d, i) => ({
        ...d,
        author: DUMMY_AUTHORS[i % DUMMY_AUTHORS.length],
        status: DUMMY_STATUS[i % DUMMY_STATUS.length],
      }));
      setDocs(withDummy);
      const map = {};
      for (const d of withDummy) map[String(d.id)] = d;
      setDocMap(map);
    } catch (e) {
      console.error("load docs error:", e);
      setDocs([]);
      setDocMap({});
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // --- jalankan semantic search
  const runSearch = useCallback(async (queryStr) => {
    const text = (queryStr ?? q).trim();
    if (!text) { clearSearch(); return; }
    setLoadingSearch(true);
    try {
      const res = await searchApi({ query: text, topK, threshold, withAnswer: false });
      setHits(res.hits || []);
    } catch (e) {
      console.error("semantic search error:", e);
      setHits([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [q, topK, threshold]);

  const clearSearch = () => {
    setHits([]);               // kosongkan hasil → kembali ke tampilan list semua dokumen
  };

  // --- hapus dokumen; jika sedang lihat hasil search, refresh hasilnya
  const doDelete = async (id) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await deleteDoc(id);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus dokumen.");
      return;
    }
    // refresh metadata list
    await loadDocs();
    // jika ada query aktif → jalankan ulang search agar hasil terbarui
    if (q.trim()) runSearch(q);
  };

  const showingSearch = q.trim().length > 0 && (loadingSearch || hits.length > 0);

  return (
    <div className="card">
      <div className="toolbar-row">
        <div className="search-input-outer">
          <span className="ic">🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for something (semantic)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (q.trim()) runSearch(q); else clearSearch();
              }
            }}
          />
          <button
            type="button"
            className={"mic-btn" + (listening ? " on" : "")}
            title={canMic ? "Search by voice" : "Mic not supported"}
            onClick={startMic}
            disabled={!canMic}
          >
            🎤
          </button>
        </div>

        <button className="btn-primary" onClick={() => navigate("/add")}>＋</button>
      </div>

      {/* PARAM (opsional) */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <small>topK</small>
        <input type="number" min="1" max="30" value={topK} onChange={e=>setTopK(Number(e.target.value)||8)} style={{ width: 64 }} />
        <small>threshold</small>
        <input type="number" step="0.01" min="0" max="1" value={threshold} onChange={e=>setThreshold(Number(e.target.value)||0.75)} style={{ width: 80 }} />
        {showingSearch && <small style={{ color:"#6b7280" }}>hasil: {hits.length}{loadingSearch?" (loading…)":""}</small>}
      </div>

      <div className="table">
        <div className="t-head">
          <div className="c-name">Name</div>
          <div className="c-author">Author</div>
          <div className="c-date">Date</div>
          <div className="c-status">Status</div>
          <div className="c-action">Action</div>
        </div>

        {/* MODE: SEMANTIC SEARCH */}
        {showingSearch ? (
          loadingSearch ? (
            <div className="t-row muted">Searching…</div>
          ) : hits.length ? (
            hits.map((h, i) => {
              const meta = docMap[String(h.docId)] || {};
              return (
                <div className="t-row" key={i}>
                  <div className="c-name">
                    <div><b>{meta.subject || `(Doc ${String(h.docId).slice(-6)})`}</b></div>
                    <div className="snippet">
                      Score: {typeof h.score === "number" ? h.score.toFixed(3) : h.score} • Hal {h.page}
                    </div>
                    <div className="snippet">{(h.text || "").slice(0, 220)}{(h.text||"").length>220?"…":""}</div>
                  </div>
                  <div className="c-author">{meta.author || "—"}</div>
                  <div className="c-date">{meta.date || "—"}</div>
                  <div className={`c-status ${String(meta.status||"").replace(/\s/g,"").toLowerCase()}`}>
                    {meta.status || "—"}
                  </div>
                  <div className="c-action">
                    <button className="btn-ghost" title="View" onClick={() => navigate(`/docs/${meta.id || h.docId}`)}>👁️</button>
                    <button className="btn-ghost" title="Delete" onClick={() => doDelete(meta.id || h.docId)}>🗑️</button>
                  </div>
                </div>
              );
            })
          ) : (
            // 👇 tidak ada hasil, tampilkan pesan sederhana
            <div className="t-row muted">Tidak ada hasil ≥ {threshold}.</div>
          )
        ) : (
          // MODE LIST DOKUMEN (bukan search)
          loadingDocs ? (
            <div className="t-row muted">Loading…</div>
          ) : docs.length ? (
            docs.map((d) => (
              <div className="t-row" key={d.id}>
                <div className="c-name">{d.subject || "(tanpa subjek)"}</div>
                <div className="c-author">{d.author}</div>
                <div className="c-date">{d.date}</div>
                <div className={`c-status ${String(d.status).replace(/\s/g, "").toLowerCase()}`}>
                  {d.status}
                </div>
                <div className="c-action">
                  <button className="btn-ghost" title="View" onClick={() => navigate(`/docs/${d.id}`)}>👁️</button>
                  <button className="btn-ghost" title="Delete" onClick={() => doDelete(d.id)}>🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="t-row muted">No documents.</div>
          )
        )}
      </div>
    </div>
  );
}
