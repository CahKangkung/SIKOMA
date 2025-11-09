// src/routes/search.routes.js
import { Router } from "express";
import multer from "multer";
import { ObjectId } from "mongodb"; // post commit 3
import { getDocumentDB } from "../services/db.js";
import { letterChunks } from "../models/letterChunks.js";
import { embedText, generateAnswer } from "../services/gemini.js";
import { transcribeAudio } from "../services/transcribe.js";

const router = Router();
const upload = multer();

router.post("/search", async (req, res, next) => {
  // const { query, topK = 8, withAnswer = false, threshold = 0.75 } = req.body;
  const { query, topK = 8, withAnswer = false, threshold = 0.75, organizationId } = req.body; // post commit 3

  // 🔹 1. Buat embedding dari teks query
  const qvec = await embedText(query);

  // 🔹 2. Akses koleksi letterChunks
  const db = await getDocumentDB();
  const ccol = letterChunks(db);

  const matchStage = organizationId ? { organizationId: new ObjectId(organizationId) } : {}; // post commit 3

  // Catatan:
  // - score dari $meta biasanya "semakin besar = semakin mirip" (cosine similarity).
  // - Untuk kompat, kita filter threshold di JS setelah aggregation.
  const pipeline = [
    {
      $vectorSearch: {
        index: "letter_chunks__vsearch",
        path: "embedding",
        queryVector: qvec,
        numCandidates: Math.max(40, topK * 6),
        limit: Math.max(20, topK * 2),
        filter: matchStage // post commit 3
      }
    },
    // simpan score di field biasa supaya aman dipakai tahap lanjut
    { $addFields: { score: { $meta: "vectorSearchScore" } } },
    {
      $project: {
        _id: 0,
        // ⚠️ Pastikan field di chunks yang menunjuk dokumen induk konsisten dengan yang dipakai di listDocs
        // Misal di chunks kamu simpan parent id di "docId" atau "letterId". Sesuaikan baris di bawah.
        docId: "$docId", // ganti ke "$letterId" kalau nama field parent di chunk = letterId
        text: 1,
        page: 1,
        score: 1,
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ];

  let hits = await chunksCol.aggregate(pipeline).toArray();

  // Filter threshold di aplikasi (hindari $match langsung ke $meta)
  if (typeof threshold === "number") {
    // asumsi score = similarity (semakin besar semakin mirip)
    hits = hits.filter((h) => Number(h.score) >= threshold);
  }

  // Ambil topK final
  hits = hits.slice(0, topK);

  return { qvec, hits };
}

router.post("/", async (req, res, next) => {
  try {
    const { orgId, query, topK = 8, withAnswer = false, threshold = null } = req.body;

    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!query || !String(query).trim()) {
      return res.json({ query: "", hitCount: 0, hits: [], answer: null });
    }

    const db = await getDocumentDB();
    const filter = orgId ? buildAccessFilter(orgId, req.user) : undefined;

    const { qvec, hits } = await runVectorSearch({
      db,
      query,
      topK: Number(topK) || 8,
      threshold: Number.isFinite(Number(threshold)) ? Number(threshold) : null,
      filter,
    });

    const answer = withAnswer && hits.length ? await generateAnswer(query, hits) : null;

    res.json({
      query,
      qdim: qvec?.length ?? 0,
      topK: Number(topK) || 8,
      threshold: Number.isFinite(Number(threshold)) ? Number(threshold) : null,
      hitCount: hits.length,
      hits,
      answer,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/search/voice", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "audio file required (field name: 'audio')" });

    let { orgId, topK = 8, threshold = null, withAnswer = false } =
      req.query?.topK ? req.query : req.body;
    topK = Number(topK) || 8;
    threshold = Number.isFinite(Number(threshold)) ? Number(threshold) : null;
    withAnswer = String(withAnswer) === "true" || withAnswer === true;

    const mime = req.file.mimetype || "audio/webm";
    const transcript = await transcribeAudio(req.file.buffer, mime, req.file.originalname || "audio");
    const query = (transcript || "").trim();

    if (!query) {
      return res.json({
        mode: "voice",
        transcript: "",
        qdim: 0,
        topK,
        threshold,
        hitCount: 0,
        hits: [],
        answer: null,
        _debug: "Empty transcript",
      });
    }

    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDocumentDB();
    const filter = orgId ? buildAccessFilter(orgId, req.user) : undefined;

    const { qvec, hits } = await runVectorSearch({
      db,
      query,
      topK,
      threshold,
      filter,
    });

    let answer = null;
    if (withAnswer && hits.length) {
      try {
        answer = await generateAnswer(query, hits);
      } catch {
        answer = null;
      }
    }

    res.json({
      mode: "voice",
      transcript: query,
      qdim: qvec.length,
      topK,
      threshold,
      hitCount: hits.length,
      hits,
      answer,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
