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

/** Helper: rakit filter akses sesuai ketentuan */
function buildAccessFilter(orgId, reqUser) {
  const orgObjId = ObjectId.isValid(orgId) ? new ObjectId(orgId) : orgId;
  const userIdStr = String(reqUser?.id || reqUser?._id || "");
  const userObjId = ObjectId.isValid(userIdStr) ? new ObjectId(userIdStr) : null;

  return {
    organizationId: orgObjId,
    $or: [
      { createdBy: userIdStr },
      ...(userObjId ? [{ createdBy: userObjId }] : []),

      { recipientsMode: "all" },

      { recipients: userIdStr },
      ...(userObjId ? [{ recipients: userObjId }] : []),
      { recipients: { $in: [userIdStr] } },
      ...(userObjId ? [{ recipients: { $in: [userObjId] } }] : []),
    ],
  };
}

/** Helper: jalankan vector search */
async function runVectorSearch({ db, query, topK = 8, threshold = null, filter }) {
  const chunksCol = letterChunks(db);
  const qvec = await embedText(query);

  const numCandidates = Math.max(40, topK * 6);
  const limit = Math.max(20, topK * 2);

  // Catatan:
  // - score dari $meta biasanya "semakin besar = semakin mirip" (cosine similarity).
  // - Untuk kompat, kita filter threshold di JS setelah aggregation.
  const pipeline = [
    {
      $vectorSearch: {
        index: "letter_chunks__vsearch",
        path: "embedding",
        queryVector: qvec,
        numCandidates,
        limit,
        ...(filter ? { filter } : {}),
      },
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
