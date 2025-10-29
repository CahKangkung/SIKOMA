import { Router } from "express";
import multer from "multer";
import { getDb, getBucket } from "../services/db.js";
import { letters } from "../models/letters.js";
import { letterChunks } from "../models/letterChunks.js";
import { parseDocx } from "../services/parse.js";
import { ocrBuffer } from "../services/ocr.js";
import { chunkText } from "../services/chunker.js";
import {
  embedText,
  summarizeText,
  summarizePdfFromBuffer, // ringkas langsung dari file
} from "../services/gemini.js";

const upload = multer(); // field name HARUS "file"
const router = Router();

/** Ambil nama file tanpa ekstensi */
function baseName(filename = "") {
  const i = filename.lastIndexOf(".");
  return i === -1 ? filename : filename.slice(0, i);
}
/** Nomor surat random */
function randomNumber() {
  const ts = Date.now();
  const r4 = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `AUTO-${ts}-${r4}`;
}
/** Tanggal random ±365 hari terakhir (YYYY-MM-DD) */
function randomDateISO() {
  const now = new Date();
  const past = new Date(now.getTime() - Math.floor(Math.random() * 365) * 24 * 3600 * 1000);
  const yyyy = past.getFullYear();
  const mm = String(past.getMonth() + 1).padStart(2, "0");
  const dd = String(past.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
/** Validasi cepat format YYYY-MM-DD */
function normalizeDate(input) {
  const s = String(input || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00Z");
  const ok =
    d instanceof Date &&
    !isNaN(d.getTime()) &&
    d.getUTCFullYear() === Number(s.slice(0, 4)) &&
    d.getUTCMonth() + 1 === Number(s.slice(5, 7)) &&
    d.getUTCDate() === Number(s.slice(8, 10));
  return ok ? s : null;
}

/* ===================== PREVIEW SUMMARY (tidak menyimpan) ===================== */
router.post("/summarize-preview", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const file = req.file;
    const mime = file.mimetype || "application/octet-stream";

    let summary = "";
    let source = "none";

    // coba ringkas langsung dari file
    try {
      summary = await summarizePdfFromBuffer(file.buffer, file.originalname, mime);
      source = "gemini-file";
    } catch (e1) {
      // fallback: OCR/parse lalu summarizeText
      let text = "";
      if (mime === "application/pdf" || mime.startsWith("image/") || mime === "application/octet-stream") {
        text = await ocrBuffer(file.buffer, mime, file.originalname);
      } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        text = await parseDocx(file.buffer);
      }
      if (text) {
        const trimmed = text.length > 20000 ? text.slice(0, 20000) : text;
        summary = await summarizeText(trimmed);
        source = "gemini-text";
      }
    }

    res.json({ ok: true, summary, source });
  } catch (e) {
    next(e);
  }
});

/* ============================ UPLOAD & SIMPAN ============================ */
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      console.warn("Upload tanpa file atau fieldName salah (harus 'file').");
      return res.status(400).json({ error: "file required" });
    }

    const file = req.file;
    const mime = file.mimetype || "application/octet-stream";

    // meta dari form
    const formSubject = (req.body.subject || "").trim();
    const formDate = normalizeDate((req.body.date || "").trim());
    const formAuthor = (req.body.author || "").trim();
    const formStatus = (req.body.status || "").trim();

    // 1) Ekstrak teks untuk indexing
    let text = "";
    if (mime === "application/pdf" || mime.startsWith("image/") || mime === "application/octet-stream") {
      text = await ocrBuffer(file.buffer, mime, file.originalname);
    } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await parseDocx(file.buffer);
    } else {
      return res.status(400).json({ error: "unsupported file type" });
    }

    // 2) Metadata — pakai nilai dari form bila tersedia
    const number = randomNumber();
    const subject = formSubject || baseName(file.originalname);
    const date = formDate || randomDateISO();
    const type = "incoming";

    const db = await getDb();
    const bucket = await getBucket();
    const lcol = letters(db);
    const ccol = letterChunks(db);

    // 3) Ringkas dari FILE (utama), fallback TEKS
    let summary = "";
    let summarySource = "none";
    try {
      summary = await summarizePdfFromBuffer(file.buffer, file.originalname, mime);
      summarySource = "gemini-file";
    } catch (e1) {
      try {
        const trimmed = text.length > 20000 ? text.slice(0, 20000) : text;
        summary = await summarizeText(trimmed);
        summarySource = "gemini-text";
      } catch (e2) {
        summary = "";
      }
    }

    // 4) Simpan file ke GridFS
    const fileId = await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: mime,
        metadata: { originalName: file.originalname },
      });
      uploadStream.end(file.buffer, (err) => (err ? reject(err) : resolve(uploadStream.id)));
    });

    // 5) Simpan dokumen
    const attachment = { name: file.originalname, mime, fileId };
    const doc = {
      number,
      subject,
      date,
      type,
      author: formAuthor || "—",
      status: formStatus || "On Review",
      summary: summary || "",
      attachments: [attachment],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { insertedId } = await lcol.insertOne(doc);

    // 6) Simpan chunks + embedding
    const parts = chunkText(text);
    for (let i = 0; i < parts.length; i++) {
      const emb = await embedText(parts[i]);
      await ccol.insertOne({
        docId: insertedId,
        page: i + 1,
        section: "body",
        text: parts[i],
        embedding: emb,
        lang: "id",
        tokens: parts[i].split(/\s+/).length,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json({
      ok: true,
      docId: insertedId,
      summary,
      summarySource,
      autoMeta: { number, subject, date },
      filePreview: { fileId, mime },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
