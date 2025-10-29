import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileMgr = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
const INLINE_LIMIT = 18 * 1024 * 1024;
const getText = (r) => (r?.response?.text?.() || "").trim();

/**
 * Transkripsi audio (mp3/wav/webm/m4a) → teks
 * Prefer Files API (stabil), fallback ke inlineData untuk file kecil.
 */
export async function transcribeAudio(buffer, mime = "audio/webm", filename = "audio") {
  const prompt = `
Transkripsikan ucapan dari berkas audio ini apa adanya (tanpa rangkuman/terjemahan).
Gunakan ejaan Bahasa Indonesia yang lazim. Jika ada bagian tidak jelas, beri tanda [tidak jelas].
`.trim();

  // 1) Files API terlebih dahulu
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const uploaded = await fileMgr.uploadFileFromBuffer(buffer, { mimeType: mime, displayName: filename });
      const filePart = { fileUri: uploaded.file.uri, mimeType: uploaded.file.mimeType };
      const model = genAI.getGenerativeModel({ model: modelName });

      // Coba 2 urutan parts
      const trials = [
        [{ role: "user", parts: [filePart, { text: prompt }] }],
        [{ role: "user", parts: [{ text: prompt }, filePart] }],
      ];
      for (const contents of trials) {
        const resp = await model.generateContent({ contents });
        const out = getText(resp);
        if (out) return out;
      }
    } catch (e) {
      console.warn(`Files API transcribe with ${modelName} failed:`, e?.message || e);
    }
  }

  // 2) inlineData fallback (untuk file kecil)
  if (buffer.length <= INLINE_LIMIT) {
    const b64 = buffer.toString("base64");
    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const trials = [
          [{ role: "user", parts: [{ inlineData: { data: b64, mimeType: mime } }, { text: prompt }] }],
          [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: b64, mimeType: mime } }] }],
        ];
        for (const contents of trials) {
          const resp = await model.generateContent({ contents });
          const out = getText(resp);
          if (out) return out;
        }
      } catch (e) {
        console.warn(`inline transcribe with ${modelName} failed:`, e?.message || e);
      }
    }
  }

  throw new Error("Transkripsi kosong setelah semua strategi");
}
