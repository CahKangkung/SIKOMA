import express from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getBucket, getDocumentDB } from "../services/db.js";
import verifyToken from "../middlewares/authMiddleware.js";
// import { verify } from "jsonwebtoken";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// upload file
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ message: "File is required" });
    // }

    const bucket = getBucket();
    const orgId = req.body.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "organizationId is required" })
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        organizationId: new ObjectId(orgId),
        uploadedBy: req.user.id
      },
      contentType: req.file.mimetype,
    });
    
    uploadStream.once("finish", () => {
      res.json({ 
        message: "✅ File uploaded successfully", 
        // fileId: uploadStream.id
        fileId: uploadStream.id.toString() //new
      });
    });
    uploadStream.once("error", (err) => {
      console.error("Upload stream error: ", err);
      res.status(500).json({ message: "Upload failed" })
    });

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// download file jika organisasi sama
router.get("/:filename", verifyToken, async (req, res) => {
  try {
    const db = getDocumentDB();
    const bucket = getBucket();
    const orgId = req.query.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "organizationId is required" })
    }

    const file = await db.collection("uploads.files").findOne({
      filename: req.params.filename,
      "metadata.organizationId": new ObjectId(orgId),
    });

    if (!file) {
      return res.status(403).json({ message: "File not found or access denied" });
    }

    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Disposition", `inline; filename="${file.filename}"`); //new

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    
    // new
    downloadStream.on("error", (err) => {
      console.error("Download stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Download failed" });
      }
    });

    downloadStream.pipe(res);

  } catch (err) {
    console.error("Download error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Download failed" });
    }
    //res.status(500).json({ message: "Download failed" });
  }
});

router.get("/id/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    let _id, _orgId;
    try {
      _id = new ObjectId(id);
      _orgId = new ObjectId (organizationId);
    } catch {
      return res.status(400).json({ message: "invalid id/organizationId" });
    }

    const db = getDocumentDB();
    const file = await db.collection("uploads.files").findOne({
      _id,
      "metadata.organizationId": _orgId
    });

    if (!file) {
      return res.status(404).json({ message: "File not found or access denied" });
    }

    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);

    const bucket = getBucket();
    const stream = bucket.openDownloadStream(_id);

    stream.on("error", (e) => {
      console.error("Download error:", e); // progress gpt sampai sini
      res.status(500).end();
    });
    stream.pipe(res);

  } catch (err) {
    console.error("Download by id error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Download failed" });
    }
    //res.status(500).json({ message: "Download failed" });
  }
})

// download by fileId (ObjectId) + cek organisasi
/*router.get("/id/:id", verifyToken, async (req, res) => {
  try {
    const db = getDocumentDB();
    const bucket = getBucket();
    const orgId = req.query.organizationId;
    if (!orgId) return res.status(400).json({ message: "organizationId is required" });

    let fid;
    try { fid = new ObjectId(req.params.id); } catch {
      return res.status(400).json({ message: "invalid file id" });
    }

    const file = await db.collection("uploads.files").findOne({
      _id: fid,
      "metadata.organizationId": new ObjectId(orgId),
    });
    if (!file) return res.status(404).json({ message: "File not found or access denied" });

    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    const stream = bucket.openDownloadStream(fid);
    stream.on("error", (e) => {
      console.error("Download stream error:", e);
      res.status(500).end();
    });
    stream.pipe(res);
  } catch (err) {
    console.error("Download by id error:", err);
    res.status(500).json({ message: "Download failed" });
  }
});*/

export default router;



// ------------------KODE LAMA-------------------------------
/*import { Router } from "express";
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

export default router;*/
