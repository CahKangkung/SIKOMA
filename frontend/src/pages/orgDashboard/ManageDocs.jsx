// src/pages/ManageDocs.jsx
import { useEffect, useState, useCallback } from "react";
import { listDocs, deleteDoc, search as searchApi } from "../../Services/api";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const TOP_K = 10;
const THRESHOLD = 0.75;

/* ---------- helpers: status mapping & colors ---------- */
function prettyStatus(s) {
  if (!s) return "On Review";
  const k = String(s).toLowerCase().replace(/\s|_/g, "");
  if (k === "approved" || k === "approve") return "Approved";
  if (k === "rejected" || k === "reject") return "Reject";
  if (k === "uploaded") return "Uploaded";
  return "On Review";
}
function statusClass(s) {
  const k = String(s).toLowerCase().replace(/\s|_/g, "");
  if (k === "approved" || k === "approve") return "text-emerald-600";
  if (k === "rejected" || k === "reject") return "text-rose-600";
  if (k === "uploaded") return "text-indigo-600";
  return "text-amber-500"; 
}
function toDateStr(v) {
  if (!v) return "-";
  // sudah "YYYY-MM-DD"?
  if(/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}

export default function ManageDocs() {
  const { id: orgId } = useParams();
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [docMap, setDocMap] = useState({});
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);  

  // STT (opsional)
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

  const loadDocs = useCallback(async () => {
    if (!orgId) return;
    setLoadingDocs(true);
    try {
      //const payload = await listDocs({ limit: 500 });
      const data = await listDocs(orgId, { limit: 500 });
      // const normalized = (payload.items || []).map((d, i) => ({
      const normalized = (data || []).map((d) => ({
        id: String(d._id),
        title: d.title || d.subject || "(untitled)",
        recipient: d.recipient || "-",
        // createdBy: d.createdByUser?.username || "Unknown",
        createdByUser: d.createdByUser, // post commit 4
        uploadDate: toDateStr(d.uploadDate || d.createdAt),
        // dueDate: toDateStr(d.dueDate) || "-",
        status: d.status || "On Review",
        // ...d,
        // author: d.author ?? DUMMY_AUTHORS[i % DUMMY_AUTHORS.length],
      }));
      setDocs(normalized);
     
      const map = {};       
      (data || []).forEach((d) => {
        map[String(d._id)] = d;
      });
      setDocMap(map);
    } catch (e) {
      console.error("listDocs error:", e);
      setDocs([]);
      setDocMap([]);
    } finally { 
      setLoadingDocs(false); 
    }
  }, [orgId]);

  useEffect(() => { 
    loadDocs(); 
  }, [loadDocs]);

  // Auto-reload ketika ViewDoc selesai submit
  useEffect(() => {
    const maybeReload = () => {
      if (localStorage.getItem("needsReloadDocs") === "1") {
        localStorage.removeItem("needsReloadDocs");
        loadDocs();
      }
    };

    // cek saat kembali ke tab / window fokus
    const onFocus = () => maybeReload();
    const onVis = () => { 
      if (document.visibilityState === "visible") maybeReload(); 
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    maybeReload();
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadDocs]);

  const runSearch = useCallback(async (queryStr) => {
    const text = (queryStr ?? q).trim();
    if (!text) return clearSearch();
    setLoadingSearch(true);
    try {
      const res = await searchApi({ 
        query: text, 
        topK: TOP_K, 
        threshold: THRESHOLD, 
        withAnswer: false,
        orgId,
      });
      setHits(res?.hits ?? []);
    } catch (e) {
      console.error("semantic search error:", e);
      setHits([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [q]);

  const clearSearch = () => setHits([]);

  const doDelete = async (id) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      // await deleteDoc(id);
      await deleteDoc(id, orgId);
      await loadDocs();
      if (q.trim()) runSearch(q);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus dokumen.");
      return;
    }
    // await loadDocs();
    // if (q.trim()) runSearch(q);
  };

  const showingSearch = q.trim().length > 0 && (loadingSearch || hits.length > 0);

  //post commit 4
  const displayUsername = (user) => {
    if (!user) return "(Deleted User)";
    if (user.isDeleted) return "(Deleted User)";
    if (user.username && user.username.startsWith("[deleted_")) return "-";
    return user.username || "Unknown";
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage="Manage Document" />

      <div className="ml-64 min-h-screen">
        <Header title="Manage Document" />

        <main className="mx-auto max-w-7xl px-6 py-6">
          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for something"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (q.trim()) runSearch(q); else clearSearch();
                  }
                }}
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-12 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                title={canMic ? "Search by voice" : "Mic not supported"}
                onClick={startMic}
                disabled={!canMic}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-lg transition
                  ${listening ? "bg-rose-100" : "hover:bg-gray-100"} ${!canMic ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                🎤
              </button>
            </div>

            <button
              className="grid h-10 w-10 place-content-center rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700"
              onClick={() => navigate(`/${orgId}/manage-document/add`)}
              title="Add document"
            >
              +
            </button>
          </div>          

          {/* Table */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
            <div className="grid grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_100px] items-center px-3 py-2 text-sm font-semibold text-gray-500">
              <div>Name</div>
              <div>Author</div>
              <div>Upload Date</div>
              <div>Status</div>
              <div className="text-center">Action</div>
            </div>
            <div className="h-px w-full bg-gray-100" />

            {/* Search mode */}
            {showingSearch ? (
              loadingSearch ? (
                <div className="px-3 py-4 text-sm text-gray-500">Searching…</div>
              ) : hits.length ? (
                hits.map((h, i) => {
                  const key = String(h.docId);
                  const meta = docMap[key] || {};
                  const displayStatus = prettyStatus(meta.status);
                  return (
                    <div key={i} className="grid grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_100px] items-start px-3 py-3 text-sm">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {meta.title || meta.subject || `(Doc ${key.slice(-6)})`}
                        </div>
                        <div className="text-xs text-gray-500">
                          Score: {typeof h.score === "number" ? h.score.toFixed(3) : h.score} • Hal {h.page}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">{h.text || ""}</div>
                      </div>
                      {/* <div className="text-gray-700">{meta.author || "—"}</div>*/} {/* post commit 4 comment */}
                      <div className="text-gray-700">{displayUsername(meta.createdByUser)}</div> {/* post commit 4 */}
                      <div className="text-gray-700">{toDateStr(meta.uploadDate || meta.createdAt)}</div>
                      <div className={`${statusClass(displayStatus)} font-medium`}>{displayStatus}</div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-full border border-indigo-200 px-2.5 py-1 text-indigo-700 hover:bg-indigo-50"
                          title="View"                          
                          onClick={() => navigate(`/${orgId}/manage-document/${key}`)}
                        >
                          👁️
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-2.5 py-1 text-rose-600 hover:bg-rose-50"
                          title="Delete"
                          onClick={() => doDelete(key)}
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="col-span-5 h-px w-full bg-gray-100 mt-3" />
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500">No Result ≥ {THRESHOLD}.</div>
              )
            ) : loadingDocs ? (
              <div className="px-3 py-4 text-sm text-gray-500">Loading…</div>
            ) : docs.length ? (
              docs.map((d) => {
                const displayStatus = prettyStatus(d.status);
                return (
                  <div key={d.id} className="grid grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_100px] items-center px-3 py-3 text-sm">                    
                    <div className="text-gray-800">{d.title || "(tanpa subjek)"}</div>
                    {/* <div className="text-gray-700">{d.createdBy}</div> */} {/* post commit 4 comment*/} 
                    <div className="text-gray-700">{displayUsername(d.createdByUser)}</div> {/* post commit 4 */}                    
                    <div className="text-gray-700">{d.uploadDate}</div>                    
                    <div className={`${statusClass(displayStatus)} font-medium`}>{displayStatus}</div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="rounded-full border border-indigo-200 px-2.5 py-1 text-indigo-700 hover:bg-indigo-50"
                        title="View"
                        onClick={() => navigate(`/${orgId}/manage-document/${d.id}`)}
                      >
                        👁️
                      </button>
                      <button
                        className="rounded-full border border-rose-200 px-2.5 py-1 text-rose-600 hover:bg-rose-50"
                        title="Delete"
                        onClick={() => doDelete(d.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="col-span-5 h-px w-full bg-gray-100 mt-3" />
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500">No documents.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
