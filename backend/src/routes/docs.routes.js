import { Router } from "express";
import { getDb, getBucket } from "../services/db.js";
import { letters } from "../models/letters.js";
import { letterChunks } from "../models/letterChunks.js";
import { ObjectId } from "mongodb";

const router = Router();

/* =========================
   LIST DOKUMEN
   GET /api/docs?limit=&page=
   ========================= */
router.get("/docs", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);

    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      lcol
        // ⬇️ pastikan status ikut diproyeksikan
        .find({}, { projection: { subject: 1, number: 1, date: 1, status: 1, attachments: 1, createdAt: 1, updatedAt: 1, author: 1, recipient: 1 } })
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
      items: items.map((d) => ({
        // ⬇️ kembalikan id sebagai string agar FE tidak jadi [object Object]
        id: String(d._id),
        subject: d.subject,
        number: d.number,
        date: d.date,
        status: d.status, // ⬅️ perbaikan: sebelumnya salah referensi doc.status
        author: d.author ?? null,
        recipient: d.recipient ?? null,
        hasPdf: !!(d.attachments && d.attachments[0]?.mime === "application/pdf"),
        attachment: d.attachments?.[0] || null,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

/* =========================
   DETAIL DOKUMEN
   GET /api/docs/:id
   ========================= */
router.get("/docs/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const id = req.params.id;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    res.json({
      _id: String(doc._id),
      subject: doc.subject,
      number: doc.number,
      date: doc.date,
      summary: doc.summary || "",
      status: doc.status,
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

/* =========================
   UPDATE STATUS (APPROVE/REJECT/ON REVIEW)
   PATCH /api/docs/:id/status
   Body: { status, comment?, approvalFileId? }
   ========================= */
router.patch("/docs/:id/status", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);

    const id = req.params.id;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const { status, comment, approvalFileId } = req.body || {};
    if (!status) return res.status(400).json({ error: "missing_status" });

    // normalisasi status
    const norm = String(status || "").toLowerCase().replace(/\s|_/g, "");
    const toSave =
      norm === "approved" || norm === "approve"
        ? "Approved"
        : norm === "reject" || norm === "rejected"
        ? "Reject"
        : "On Review";

    const updateData = {
      status: toSave,
      updatedAt: new Date(),
    };

    if (comment) updateData.comment = comment;

    if (approvalFileId) {
      // Jika Approved + upload file baru → ganti attachments
      updateData.attachments = [
        {
          fileId: approvalFileId,
          mime: "application/pdf", // sesuaikan jika file bisa non-PDF
        },
      ];
    }

    // Kompatibel dengan driver v3/v4
    const result = await lcol.findOneAndUpdate(
      { _id },
      { $set: updateData },
      { returnDocument: "after", returnOriginal: false }
    );

    const updated = result.value;
    if (!updated) return res.status(404).json({ error: "not_found" });

    res.json({
      _id: String(updated._id),
      subject: updated.subject,
      number: updated.number,
      date: updated.date,
      summary: updated.summary || "",
      status: updated.status,
      author: updated.author ?? null,
      recipient: updated.recipient ?? null,
      attachments: updated.attachments || [],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (e) {
    console.error("update status error:", e);
    next(e);
  }
});

/* =========================
   HAPUS DOKUMEN
   DELETE /api/docs/:id
   ========================= */
router.delete("/docs/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const bucket = await getBucket();
    const lcol = letters(db);
    const ccol = letterChunks(db);

    const id = req.params.id;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    let deletedFiles = 0;
    if (Array.isArray(doc.attachments)) {
      for (const att of doc.attachments) {
        if (att?.fileId) {
          try {
            const fid = ObjectId.isValid(att.fileId) ? new ObjectId(att.fileId) : att.fileId;
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

export default router;
