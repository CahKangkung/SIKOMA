// src/routes/search.routes.js
import { Router } from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getDocumentDB } from "../services/db.js";
import { letterChunks } from "../models/letterChunks.js";
import { embedText, generateAnswer } from "../services/gemini.js";
import { transcribeAudio } from "../services/transcribe.js";

const router = Router();
const upload = multer();

/** Build filter untuk vectorSearch pada koleksi chunks.
 *  Saat ini hanya memfilter by organizationId (sesuai "post commit 3").
 *  Jika organizationId bukan ObjectId valid, pakai string apa adanya.
 */
function buildAccessFilter(orgId /*, user */) {
  if (!orgId) return {};
  const orgObjId = ObjectId.isValid(orgId) ? new ObjectId(orgId) : orgId;
  return { organizationId: orgObjId };
}

/** Jalankan vector search pada koleksi letterChunks. */
async function runVectorSearch({ db, query, topK = 8, threshold = null, filter = {} }) {
  const chunksCol = letterChunks(db);
  const qvec = await embedText(query);

  const pipelineLimit = Math.max(20, topK * 2);
  const numCandidates = Math.max(40, topK * 6);

  const vectorStage = {
    $vectorSearch: {
      index: "letter_chunks__vsearch",
      path: "embedding",
      queryVector: qvec,
      numCandidates,
      limit: pipelineLimit,
      ...(filter && Object.keys(filter).length ? { filter } : {}),
    },
  };

  const pipeline = [
    vectorStage,
    { $addFields: { score: { $meta: "vectorSearchScore" } } },
    {
      $project: {
        _id: 0,
        // ganti ke "$letterId" kalau field parent di chunk adalah "letterId"
        docId: "$docId",
        text: 1,
        page: 1,
        score: 1,
      },
    },
    { $sort: { score: -1 } },
    { $limit: pipelineLimit },
  ];

  let hits = await chunksCol.aggregate(pipeline).toArray();

  if (Number.isFinite(Number(threshold))) {
    hits = hits.filter((h) => Number(h.score) >= Number(threshold));
  }

  // Ambil topK final
  hits = hits.slice(0, Number(topK) || 8);

  return { qvec, hits };
}

// ---- TEXT SEARCH ----
// Jika router di-mount: app.use("/search", router)
// endpoint final: POST /search
router.post("/", async (req, res, next) => {
  try {
    const { orgId, organizationId, query, topK = 8, withAnswer = false, threshold = null } = req.body;

    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!query || !String(query).trim()) {
      return res.json({ query: "", hitCount: 0, hits: [], answer: null });
    }

    const db = await getDocumentDB();
    const filter = buildAccessFilter(orgId || organizationId /*, req.user */);

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
      qdim: Array.isArray(qvec) ? qvec.length : 0,
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

// ---- VOICE SEARCH ----
// endpoint final: POST /search/voice
router.post("/voice", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "audio file required (field name: 'audio')" });
    }

    // Query bisa datang dari querystring (mis. curl) atau body (frontend)
    let { orgId, organizationId, topK = 8, threshold = null, withAnswer = false } =
      req.query?.topK ? req.query : req.body;

    topK = Number(topK) || 8;
    threshold = Number.isFinite(Number(threshold)) ? Number(threshold) : null;
    withAnswer = String(withAnswer) === "true" || withAnswer === true;

    const mime = req.file.mimetype || "audio/webm";
    const transcript = await transcribeAudio(
      req.file.buffer,
      mime,
      req.file.originalname || "audio"
    );
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
    const filter = buildAccessFilter(orgId || organizationId /*, req.user */);

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
        answer = null; // jangan patahkan seluruh response hanya karena answer gagal
      }
    }

    res.json({
      mode: "voice",
      transcript: query,
      qdim: Array.isArray(qvec) ? qvec.length : 0,
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
