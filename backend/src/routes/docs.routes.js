// docs.routes.js
import { Router } from "express";
import { getDb, getBucket } from "../services/db.js";
import { letters } from "../models/letters.js";
import { letterChunks } from "../models/letterChunks.js";
import { ObjectId } from "mongodb";

const router = Router();

// util kecil
const toId = (v) => (ObjectId.isValid(v) ? new ObjectId(v) : v);
const CANON = (s) => {
  const k = String(s || "").toLowerCase().replace(/\s/g, "");
  if (k === "uploaded") return "Uploaded";
  if (k === "approved" || k === "approve") return "Approved";
  if (k === "reject" || k === "rejected") return "Reject";
  return "On Review";
};

/* ===========================
   LIST: GET /docs
   - sekarang termasuk field `status`
=========================== */
router.get("/docs", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);

    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const projection = {
      subject: 1,
      number: 1,
      date: 1,
      status: 1,           // ← penting
      author: 1,
      recipient: 1,
      attachments: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const [items, total] = await Promise.all([
      lcol
        .find({}, { projection })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      lcol.countDocuments(),
    ]);

    res.json({
      page,
      limit,
      total,
      items: items.map((d) => {
        const first = d.attachments?.[0] || null;
        return {
          id: d._id, // FE kamu pakai `id`
          subject: d.subject,
          number: d.number,
          date: d.date,
          status: CANON(d.status),            // ← pastikan rapi
          author: d.author ?? null,
          recipient: d.recipient ?? null,
          hasPdf: !!(first && first.mime === "application/pdf"),
          attachment: first,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      }),
    });
  } catch (e) {
    next(e);
  }
});

/* ===========================
   DETAIL: GET /docs/:id
=========================== */
router.get("/docs/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const _id = toId(req.params.id);

    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    res.json({
      _id: doc._id,
      subject: doc.subject,
      number: doc.number,
      date: doc.date,
      summary: doc.summary || "",
      status: CANON(doc.status),         // seragam
      author: doc.author ?? null,
      recipient: doc.recipient ?? null,
      attachments: doc.attachments || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});

/* ===========================
   UPDATE STATUS: PATCH /docs/:id/status
   Body: { status: "Uploaded" | "On Review" | "Approved" | "Reject", comment?, approvalFileId? }
   - Untuk saat ini kita simpan hanya `status` + `updatedAt`.
   - Kalau mau, kamu bisa tambahkan penyimpanan comment / approvalFileId di sini.
=========================== */
router.patch("/docs/:id/status", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const _id = toId(req.params.id);

    const raw = String(req.body?.status || "");
    const normalized = CANON(raw);

    const ALLOWED = ["Uploaded", "On Review", "Approved", "Reject"];
    if (!ALLOWED.includes(normalized)) {
      return res.status(400).json({ error: "invalid_status" });
    }

    const now = new Date();
    await lcol.updateOne(
      { _id },
      {
        $set: {
          status: normalized,
          updatedAt: now,
          // Optional:
          // "review.comment": req.body.comment ?? null,
          // "approval.fileId": req.body.approvalFileId ?? null,
        },
      }
    );

    // Kembalikan dokumen terbaru (format seperti GET /docs/:id)
    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    res.json({
      _id: doc._id,
      subject: doc.subject,
      number: doc.number,
      date: doc.date,
      summary: doc.summary || "",
      status: CANON(doc.status),
      author: doc.author ?? null,
      recipient: doc.recipient ?? null,
      attachments: doc.attachments || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});

/* ===========================
   DELETE: DELETE /docs/:id
=========================== */
router.delete("/docs/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const bucket = await getBucket();
    const lcol = letters(db);
    const ccol = letterChunks(db);

    const _id = toId(req.params.id);

    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    let deletedFiles = 0;
    if (Array.isArray(doc.attachments)) {
      for (const att of doc.attachments) {
        if (att?.fileId) {
          try {
            const fid = toId(att.fileId);
            await bucket.delete(fid);
            deletedFiles++;
          } catch (e) {
            console.warn("GridFS delete warn:", e?.message || e);
          }
        }
      }
    }

    const chunksResult = await ccol.deleteMany({ docId: _id });
    const docResult = await lcol.deleteOne({ _id });

    res.json({
      ok: true,
      deleted: {
        letters: docResult.deletedCount || 0,
        letter_chunks: chunksResult.deletedCount || 0,
        files: deletedFiles,
      },
    });
  } catch (e) {
    next(e);
  }
});

// PATCH: update status / comment / approval file
router.patch("/docs/:id/status", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const id = req.params.id;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const { status, comment, approvalFileId } = req.body || {};

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (comment) updateData.comment = comment;
    if (approvalFileId) {
      updateData.attachments = [
        { fileId: approvalFileId, mime: "application/pdf" }, // tambahkan sesuai kebutuhan
      ];
    }

    const result = await lcol.findOneAndUpdate(
      { _id },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result.value)
      return res.status(404).json({ error: "not_found" });

    res.json(result.value);
  } catch (e) {
    console.error("update status error:", e);
    next(e);
  }
});

export default router;
