// src/pages/AddDoc.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { upload, createDocument, summarizePreview, getOrgMembers } from "../../Services/api";
import Sidebar from "../../components/SideBar";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../../context/UserContext";

// const RECIPIENTS = [
//   "UKM Seni Rupa",
//   "Himpunan Mahasiswa SI",
//   "UKM Robotika",
//   "BEM Fakultas",
// ];

export default function AddDoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  //form fields
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(""); 
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(""); 
  
  // recipient controls
  // const [recipient, setRecipient] = useState("");
  const [recipientsMode, setRecipientsMode] = useState("all");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [members, setMembers] = useState([]);
  
  // ui state
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error" | "warning"
    title: "",
    message: "",
    onConfirm: null
  });

  const showNotification = (type, title, message, onConfirm = null) => {
    setPopupConfig({ type, title, message, onConfirm });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupConfig.onConfirm) {
      popupConfig.onConfirm();
    }
  };
  
  useEffect(() => {
    if (userLoading) {
      return;
    }

    const fetchMember = async () => {
      try {
        const data = await getOrgMembers(id);
        const meId = String(user?.id || "");

        const list = (data?.members || [])
          .map((m) => m?.user)
          .filter(Boolean)
          .filter((u) => String(u._id) !== meId)
          .map((u) => ({ 
            id: String(u._id), 
            username: u.username, 
            email: u.email })) || [];

        setMembers(list);

        if (list.length === 0 && recipientsMode === "specific") {
          setRecipientsMode("all");
          setSelectedRecipients([]);
        }
      } catch (err) {
        console.error("load members error:", err);
      }
    }

    fetchMember();
  }, [id, user?.id, userLoading]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const doSummarize = async () => {
    if (!file) {
      showNotification("warning", "No File Selected", "Please select a file first.");
      return;
    };

    try {
      setLoadingAI(true);
      const fd = new FormData();
      fd.append("file", file);
      // fd.append("organizationId", id);
      const data = await summarizePreview(fd); 
      const ok = typeof data?.ok === "boolean" ? data.ok : true;
      const summary = (data?.summary || "").trim();

      if (ok && summary) {
        setNotes(summary);
        // setNotes(data.summary);
        // setNotes(data.summary || "");
      } else {
         showNotification(
          "warning", 
          "Summary Unavailable", 
          "Summary is not available at this time. You can still submit the document."
        );
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Generation Failed", "Failed to generate summary.");
    } finally {
      setLoadingAI(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; 

    if (!title.trim()) {
      showNotification("warning", "Missing Information", "Please fill in the Document Title.");
      return;
    }
    if (!file) {
      showNotification("warning", "Missing Information", "Please upload a file.");
      return;
    }
    // if (!recipient) return alert("Pilih recipient.");
    if (!due) {
      showNotification("warning", "Missing Information", "Please fill in the Due Date.");
      return;
    }

    if (recipientsMode === "specific" && selectedRecipients.length === 0) {
      showNotification(
        "warning", 
        "Missing Information", 
        "Please select at least one member as recipient."
      );
      return;
    }

    try {
      setSubmitting(true);

      const uploadDate = new Date().toISOString().slice(0, 10);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("organizationId", id);
      const uploadRes = await upload(fd);
      const fileId = uploadRes.fileId;

      const newDoc = {
        title: title.trim(),
        description: notes.trim() || "",
        organizationId: id,
        fileId,
        status: "Uploaded",        
        dueDate: due,
        uploadDate,
        recipientsMode,
        recipients:
          recipientsMode === "specific" ? selectedRecipients : []               
      };

      await createDocument(newDoc);

      // ------KODE LAMA-------
      // alert("✅ Dokumen berhasil diunggah dan disimpan!");
      // navigate(`/${id}/manage-document`);

      showNotification(
        "success", 
        "Success", 
        "Document has been successfully uploaded and saved!",
        () => navigate(`/${id}/manage-document`)
      );

      // ------KODE LAMA-------
      // fd.append("file", file);
      // fd.append("subject", title.trim());
      // fd.append("author", recipient);
      // fd.append("date", uploadDate);
      // fd.append("dueDate", due);
      // fd.append("status", "Uploaded");
      // fd.append("comment", "");
      // if (notes?.trim()) fd.append("notes", notes.trim());

      // await upload(fd);

      // alert("Dokumen tersimpan!");
      // navigate("/manage-document");
   
    } catch (e2) {
      console.error(e2);
      showNotification("error", "Submission Failed", "Failed to submit document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage="Manage Document" orgId={id} />

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
            // onClick={() => navigate(-1)}
            onClick={() => navigate(`/${id}/manage-document`)}
            className="mb-6 inline-flex items-center gap-2 text-[#23358B] hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Add New Document</span>
          </button>

          <form
            onSubmit={onSubmit}
            onKeyDown={(e) => {
              if (submitting && e.key === "Enter") e.preventDefault();
            }}
            className="space-y-6"
          >
            {/* Document Title */}
            <div>
              <label className="block text-sm font-semibold text-[#23358B]">
                Document Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mis. Proposal Pasar Seni"
                disabled={submitting}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
              />
            </div>

            {/* Upload File */}
            <div>
              <label className="block text-sm font-semibold text-[#23358B] mb-2">
                Upload Document
              </label>
              <label
                className={`block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-10 text-center hover:bg-indigo-50 ${
                  submitting ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  className="hidden"
                  onChange={onPickFile}
                  disabled={submitting}
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

            {/* Notes + Generate with AI */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#23358B]">
                  Summary
                </label>
                <button
                  type="button"
                  onClick={doSummarize}
                  disabled={loadingAI || !file || submitting}
                  className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {loadingAI ? "Generating…" : "Generate with AI"}
                </button>
              </div>
              <textarea
                rows={6}
                placeholder="Tambahkan ringkasan/notes (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
              />
            </div>

            {/* Recipient & Due Date */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#23358B]">
                  Recipient (can view & set status)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="recMode"
                      value="all"
                      checked={recipientsMode === "all"}
                      onChange={() => {
                        setRecipientsMode("all");
                        setSelectedRecipients([]);
                      }}
                      disabled={submitting}
                    />
                    <span>Everyone (all members)</span>
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input 
                      type="radio"
                      name="recMode"
                      value="specific"
                      checked={recipientsMode === "specific"}
                      onChange={() => {
                        setRecipientsMode("specific");
                        setSelectedRecipients([]);
                      }}
                      disabled={submitting || members.length === 0}
                      title={
                        members.length === 0
                          ? "No members found" : ""
                      }
                    />
                    <span>Specific member(s)</span>
                  </label>               
                </div>

                {recipientsMode === "specific" && (
                  <div className="mt-3 rounded-xl border border-gray-200 p-3">
                    {members.length === 0 ? (
                      <div className="text-sm text-gray-500">No members found.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {members.map((m) => {
                          const checked = selectedRecipients.includes(m.id);
                          return (
                            <label key={m.id} className="inline-flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRecipients((prev) => [...prev, m.id]);
                                  } else {
                                    setSelectedRecipients((prev) => prev.filter((x) => x !== m.id));
                                  }
                                }}
                                disabled={submitting}
                              />
                              <span className="text-sm">
                                {m.username}{" "}
                                <span className="text-gray-400 text-xs">({m.email})</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={submitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                >
                  <option value="" disabled>
                    Please choose the recipient
                  </option>
                  {RECIPIENTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select> */}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-[#23358B]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  disabled={submitting}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                // aria-disabled={submitting}
                className={`rounded-xl px-8 py-3 text-white font-semibold transition ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#133962] hover:opacity-90"
                }`}
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
