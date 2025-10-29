import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ GEMINI_API_KEY tidak ditemukan di .env");

const genAI = new GoogleGenerativeAI(apiKey);
const fileMgr = new GoogleAIFileManager(apiKey);

// 18 MB: aman untuk inlineData
const INLINE_LIMIT = 18 * 1024 * 1024;

function guessMime(filename = "", fallback = "application/pdf") {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return map[ext] || fallback;
}

/** 🔹 Embedding 768-dim untuk Atlas Vector Search */
export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });
  return res.embedding.values;
}

/** 🔹 Ringkas dokumen dari STRING teks (dipakai oleh ingest/docs routes) */
export async function summarizeText(text) {
  const basePrompt = `
Kamu adalah asisten AI yang ahli memahami dokumen formal (proposal/laporan/surat).
Tulis **intisari** dari teks berikut:
- 1 paragraf, maks 5 kalimat (≤120 kata).
- **Parafrase total** (jangan menyalin kalimat/heading/bullet).
- Gaya formal, ringkas, naratif; tanpa daftar/penomoran/heading.
Teks:
${text}
`.trim();
  const cfg = { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 220 };

  for (const modelName of MODEL_CANDIDATES) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompts = [
      basePrompt,
      basePrompt + "\n\nTulis ulang lebih natural & naratif, hindari penyalinan struktur/heading/bullet dari teks sumber.",
    ];
    for (const p of prompts) {
      try {
        const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: p }] }], generationConfig: cfg });
        const out = getOut(resp);
        if (out) return out;
      } catch (e) {
        console.warn(`summarizeText with ${modelName} failed:`, e?.message || e);
      }
    }
  }
  throw new Error("Empty summary from Gemini (v1)");
}

// --- Model fallback list (v1) ---
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// Helper ambil teks dari response
const getOut = (resp) => (resp?.response?.text?.() || "").trim();

/** 🔹 (Opsional) Ringkas LANGSUNG dari FILE (PDF/DOCX/IMG) */
export async function summarizePdfFromBuffer(buffer, filename, mimeType) {
  const mime = mimeType === "application/octet-stream" ? guessMime(filename) : mimeType;
  const prompt = `
Kamu adalah asisten AI yang ahli membaca dokumen formal (proposal/laporan/surat).
Tulis **intisari** singkat (1 paragraf, ≤5 kalimat, ≤120 kata), gaya formal & **parafrase** (jangan menyalin).
Sorot tujuan, kegiatan utama, waktu/tempat, dan hasil/manfaat bila ada. Hindari heading, penomoran, bullet.
`.trim();
  const cfg = { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 220 };

  // 1) Files API — model candidates
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const uploaded = await fileMgr.uploadFileFromBuffer(buffer, { mimeType: mime, displayName: filename || "document" });
      const filePart = { fileUri: uploaded.file.uri, mimeType: uploaded.file.mimeType };
      const model = genAI.getGenerativeModel({ model: modelName });

      // Coba 2 urutan parts
      const trials = [
        [{ role: "user", parts: [filePart, { text: prompt }] }],
        [{ role: "user", parts: [{ text: prompt }, filePart] }],
      ];
      for (const contents of trials) {
        const resp = await model.generateContent({ contents, generationConfig: cfg });
        const out = getOut(resp);
        if (out) return out;
      }
    } catch (e) {
      console.warn(`Files API with ${modelName} failed:`, e?.message || e);
    }
  }

  // 2) inlineData fallback
  const base64 = buffer.toString("base64");
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const trials = [
        [{ role: "user", parts: [{ inlineData: { data: base64, mimeType: mime } }, { text: prompt }] }],
        [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64, mimeType: mime } }] }],
      ];
      for (const contents of trials) {
        const resp = await model.generateContent({ contents, generationConfig: cfg });
        const out = getOut(resp);
        if (out) return out;
      }
    } catch (e) {
      console.warn(`inlineData with ${modelName} failed:`, e?.message || e);
    }
  }

  throw new Error("Empty summary after all strategies (v1)");
}

/** 🔹 Jawaban RAG dari hits vector search (dipanggil di search.routes) */
export async function generateAnswer(query, hits = []) {
  try {
    const context = hits.map((h, i) => `(${i + 1}) ${h.text}`).join("\n\n");
    const prompt =
      `Gunakan konteks berikut untuk menjawab pertanyaan pengguna dalam Bahasa Indonesia.\n` +
      `Jika tidak relevan, katakan tidak ada jawaban yang tepat.\n\n` +
      `Konteks:\n${context}\n\n` +
      `Pertanyaan: ${query}\n\n` +
      `Jawaban:`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const resp = await model.generateContent([{ role: "user", parts: [{ text: prompt }] }]);
    return (resp?.response?.text?.() || "").trim();
  } catch (err) {
    console.error("❌ generateAnswer gagal:", err?.message || err);
    return "Tidak dapat menghasilkan jawaban.";
  }
}
