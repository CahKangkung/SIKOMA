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

  // 🔹 3. Jalankan vektor search (Atlas Search)
  const cursor = ccol.aggregate([
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
    { $project: { text: 1, docId: 1, page: 1, score: { $meta: "vectorSearchScore" } } },
    { $match: { score: { $gte: Number(threshold) } } },
    { $sort: { score: -1 } },
    { $limit: topK }
  ]);

  const hits = await cursor.toArray();

  res.json({
    query,
    hitCount: hits.length,
    hits,
    answer: withAnswer && hits.length ? await generateAnswer(query, hits) : null
  });
});

router.post("/search/voice", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "audio file required (field name: 'audio')" });

    // baca param dari query atau body
    let { topK = 8, threshold = 0.75, withAnswer = false } = req.query?.topK ? req.query : req.body;
    topK = Number(topK) || 8;
    threshold = Number.isFinite(Number(threshold)) ? Number(threshold) : 0.75;
    withAnswer = String(withAnswer) === "true" || withAnswer === true;

    // 1) transkripsi audio → teks query
    const mime = req.file.mimetype || "audio/webm";
    const transcript = await transcribeAudio(req.file.buffer, mime, req.file.originalname || "audio");
    const query = (transcript || "").trim();

    if (!query) {
      return res.json({
        mode: "voice",
        transcript: "",
        qdim: 0, topK, threshold, hitCount: 0, hits: [], answer: null, _debug: "Empty transcript"
      });
    }

    // 2) embed query & vector search
    const qvec = await embedText(query);
    const db = await getDocumentDB();
    const ccol = letterChunks(db);

    const cursor = ccol.aggregate([
      {
        $vectorSearch: {
          index: "letter_chunks__vsearch",
          path: "embedding",
          queryVector: qvec,
          numCandidates: Math.max(40, topK * 6),
          limit: Math.max(20, topK * 2),
        }
      },
      { $project: { text: 1, docId: 1, page: 1, score: { $meta: "vectorSearchScore" } } },
      { $match: { score: { $gte: threshold } } },
      { $sort: { score: -1 } },
      { $limit: topK },
    ]);

    const hits = await cursor.toArray();

    // 3) optional RAG
    let answer = null;
    if (withAnswer && hits.length) {
      try { answer = await generateAnswer(query, hits); } catch { answer = null; }
    }

    res.json({
      mode: "voice",
      transcript: query,
      qdim: qvec.length,
      topK, threshold,
      hitCount: hits.length,
      hits,
      answer
    });
  } catch (e) { next(e); }
});

export default router;
