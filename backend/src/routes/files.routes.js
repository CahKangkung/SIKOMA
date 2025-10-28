import { Router } from "express";
import { getBucket } from "../services/db.js";
import { ObjectId } from "mongodb";

const router = Router();

// GET /api/files/:id           → inline (preview jika PDF)
// GET /api/files/:id?download=1 → force download
router.get("/files/:id", async (req, res, next) => {
  try {
    const bucket = await getBucket();
    const fileId = req.params.id;
    const _id = ObjectId.isValid(fileId) ? new ObjectId(fileId) : fileId;

    const files = await bucket.find({ _id }).toArray();
    if (!files.length) return res.status(404).send("File not found");

    const meta = files[0];
    const isDownload = String(req.query.download || "") === "1";
    const filename = meta.filename || `file-${meta._id}`;
    const contentType = meta.contentType || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    if (isDownload) {
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    } else if (contentType === "application/pdf") {
      // inline preview untuk PDF
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`);
    }

    const dl = bucket.openDownloadStream(_id);
    dl.on("error", next);
    dl.pipe(res);
  } catch (e) { next(e); }
});

export default router;
