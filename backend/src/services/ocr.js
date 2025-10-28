import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ GEMINI_API_KEY tidak ditemukan di .env");

const genAI = new GoogleGenerativeAI(apiKey);
const fileMgr = new GoogleAIFileManager(apiKey);

// batas inlineData 18MB
const INLINE_LIMIT = 18 * 1024 * 1024;

/**
 * OCR universal via Gemini API (PDF/gambar)
 * - otomatis pakai inlineData untuk file kecil
 * - pakai Files API kalau file besar (>18MB)
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @param {string} filename
 */
export async function ocrBuffer(buffer, mimeType = "application/pdf", filename = "document") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt =
      "Ekstrak teks dari file ini **apa adanya** (tanpa terjemahan, tanpa penambahan). " +
      "Pertahankan baris, spasi, dan format dasar.";

    // file kecil → inlineData
    if (buffer.length <= INLINE_LIMIT) {
      const base64 = buffer.toString("base64");
      const resp = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { data: base64, mimeType } }
            ],
          },
        ],
      });
      const out = (resp?.response?.text?.() || "").trim();
      if (!out) throw new Error("OCR result kosong (inline)");
      return out;
    }

    // file besar → upload ke Files API
    const uploaded = await fileMgr.uploadFileFromBuffer(buffer, {
      mimeType,
      displayName: filename,
    });
    const filePart = { fileUri: uploaded.file.uri, mimeType: uploaded.file.mimeType };

    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [filePart, { text: prompt }] }],
    });
    const out = (resp?.response?.text?.() || "").trim();
    if (!out) throw new Error("OCR result kosong (fileUri)");
    return out;
  } catch (err) {
    console.error("❌ OCR Gemini gagal:", err?.message || err);
    throw err;
  }
}
