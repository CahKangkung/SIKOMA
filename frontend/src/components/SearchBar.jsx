import { useEffect, useRef, useState } from "react";

export default function SearchBar({ onSearch, onVoiceSearch }) {
  const [q, setQ] = useState("");
  const [rag, setRag] = useState(false);
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setListening(false);
        if (typeof onVoiceSearch === "function") {
          await onVoiceSearch(blob, { withAnswer: rag, topK: 8, threshold: 0.75 });
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setListening(true);
    } catch (err) {
      alert("Tidak bisa akses mikrofon. Izinkan mic di browser.");
      console.error(err);
    }
  };

  const stopRec = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 🔹 Ketika tekan Enter, langsung trigger pencarian
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onSearch && q.trim()) {
        onSearch({ query: q, withAnswer: rag });
      }
    }
  };

  return (
    <div className="searchbar">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={handleKeyDown} // ⬅️ event enter
        placeholder={listening ? "Mendengarkan… klik mic untuk berhenti" : "Cari surat…"}
      />
      <label className="chk">
        <input type="checkbox" checked={rag} onChange={() => setRag(!rag)} /> Ringkas jawaban
      </label>
      <button onClick={() => onSearch({ query: q, withAnswer: rag })}>Cari</button>
      <button
        onClick={listening ? stopRec : startRec}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: 0,
          background: listening ? "#dc2626" : "#2563eb",
          color: "#fff",
          cursor: "pointer",
        }}
        title={listening ? "Klik untuk berhenti merekam" : "Cari dengan suara"}
      >
        {listening ? "Stop 🎙️" : "Mic 🎤"}
      </button>
    </div>
  );
}
