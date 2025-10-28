import { Router } from "express";
import { getDb, getBucket } from "../services/db.js";
import { letters } from "../models/letters.js";
import { letterChunks } from "../models/letterChunks.js";
import { ObjectId } from "mongodb";

const router = Router();

// List
router.get("/docs", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      lcol
        .find({}, { projection: { subject: 1, number: 1, date: 1, attachments: 1, createdAt: 1, updatedAt: 1 } })
        .sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
      lcol.countDocuments()
    ]);

    res.json({
      page, limit, total,
      items: items.map(d => ({
        id: d._id,
        subject: d.subject,
        number: d.number,
        date: d.date,
        hasPdf: !!(d.attachments && d.attachments[0]?.mime === "application/pdf"),
        attachment: d.attachments?.[0] || null,
        updatedAt: d.updatedAt, createdAt: d.createdAt
      }))
    });
  } catch (e) { next(e); }
});

// Detail (TANPA auto-summarize)
router.get("/docs/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const lcol = letters(db);
    const id = req.params.id;
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const doc = await lcol.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "not_found" });

    // kembalikan apa adanya (summary jika sudah ada akan ikut)
    res.json({
      _id: doc._id,
      subject: doc.subject,
      number: doc.number,
      date: doc.date,
      summary: doc.summary || "",
      attachments: doc.attachments || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  } catch (e) { next(e); }
});

// Hapus (tetap sama, memastikan file GridFS & chunks ikut dibersihkan)
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
        files: deletedFiles
      }
    });
  } catch (e) { next(e); }
});

export default router;
