import express from "express";
import { ObjectId } from "mongodb";
import verifyToken from "../middlewares/authMiddleware.js";
import { LetterModel } from "../models/letters.js";
import { getDocumentDB } from "../services/db.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
// import { verify } from "jsonwebtoken";

const router = express.Router();

const asObjId = (x) => {
  try {
    return new ObjectId(String(x));
  } catch {
    return null;
  }
}

async function getOrgRole(userId, orgId) {
  const org = await Organization.findById(orgId).select("createdBy members");
  if (!org) {
    return { exists: false, isOwner: false, isAdmin: false, isMember: false };
  }
  const isOwner = String(org.createdBy) === String(userId);
  const mem = org.members.find((m) => String(m.user) === String(userId));
  const isAdmin = isOwner || (mem && mem.role === "admin");
  const isMember = isOwner || !!mem;
  return { exists: true, isOwner, isAdmin, isMember };

}

function orIdForms(field, uid) {
  const oid = asObjId(uid);
  return oid ? [{ [field]: oid }, { [field]: String(uid) }] : [{ [field]: String(uid) }];
}

// get semua dokumen 
router.get("/", verifyToken, async (req, res) => {
  try {
    const orgId = req.query.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const orgObjId = asObjId(orgId);
    if (!orgObjId) {
      return res.status(400).json({ message: "invalid organizationId" });

    }

    const { isAdmin } = await getOrgRole(req.user.id, orgId);

    // limit baru ditambahkan
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? "100", 10) || 100, 1),
      1000
    );

    const db = getDocumentDB();
    const col = LetterModel(db);

    let query;
    if (isAdmin) {
      // admin/pemilik melihat semua dokumen organisasi
      query = { organizationId: orgObjId };
    } else {
      // user biasa: dokumen miliknya / 'all' / ia ada di recipients
      query = {
        organizationId: orgObjId,
        $or: [
          ...orIdForms("createdBy", req.user.id),
          { recipientsMode: "all" },
          ...orIdForms("recipients", req.user.id),
        ],
      };
    }

    // const letters = await LetterModel.findByOrg(orgId);
    // const letters = await col.find({ organizationId: new ObjectId(orgId) })
    const letters = await col.find(query)
      .sort({ createdAt: -1 })
      .limit(limit) //baru
      .toArray();

    // join uploader + recipients → kirim username/email
    const userIds = new Set();
    letters.forEach((l) => {
      if (l.createdBy) userIds.add(String(l.createdBy));
      (l.recipients || []).forEach((r) => userIds.add(String(r)));
    });

    const users = userIds.size ?
      await User.find({ _id: { $in: [...userIds] } }, "username email").lean()
      : [];

    const uMap = {};
    users.forEach((u) => (
      uMap[String(u._id)] = { id: String(u._id), username: u.username, email: u.email }
    ));

    const payload = letters.map((l) => ({
      ...l,
      _id: String(l._id),
      createdBy: String(l.createdBy || ""),
      createdByUser: uMap[String(l.createdBy)] || null,
      recipientsMode: l.recipientsMode || "all",
      recipients: (l.recipients || []).map((r) => String(r)),
      recipientsUsers: (l.recipients || []).map((r) => uMap[String(r)]).filter(Boolean),
    }));

    // const authorId = [
    //   ...new Set(
    //     letters
    //       .map((l) => (l.createdBy ? String(l.createdBy) : null))
    //       .filter(Boolean)
    //   ),
    // ];

    // let authors = [];

    // if (authorId.length) {
    //   authors = await User.find(
    //     { _id: { $in: authorId } },
    //     "username email"
    //   ).lean();
    // }

    // const uMap = {};
    // authors.forEach((u) => {
    //   uMap[String(u._id)] = {
    //     id: String(u._id),
    //     username: u.username,
    //     email: u.email
    //   };
    // });

    // const payload = letters.map((l) => ({
    //   ...l,
    //   createdBy: String(l.createdBy || ""),
    //   createdByUser: uMap[String(l.createdBy)] || null,
    // }));
    
    res.json(payload);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

// post dokumen baru
router.post("/", verifyToken, async (req, res) => {
  try {
    // const orgId = req.user.organizationId;
    const { 
      title, description, status, 
      organizationId, fileId, 
      recipientsMode = "all",
      recipients = [], 
      dueDate, 
      uploadDate } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    // Validasi recipients: harus anggota organisasi
    let recIds = [];
    if (recipientsMode === "specific") {
      const org = await Organization.findById(organizationId).select("createdBy members");
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const allowed = new Set([String(org.createdBy), ...org.members.map((m) => String(m.user))]);
      recIds = (Array.isArray(recipients) ? recipients : [])
        .map(String)
        .filter((uid) => allowed.has(uid))
        .map((uid) => asObjId(uid))
        .filter(Boolean);
    }

    const db = getDocumentDB();
    const col = LetterModel(db);

    // let createdBy = req.user.id;
    // try {
    //   createdBy = new ObjectId(req.user.id);
    // } catch {}

    // const doc = {
    //   title: title.trim(),
    //   description: (description || "").trim(),
    //   recipient: recipient || null,
    //   dueDate: dueDate || null,
    //   uploadDate: uploadDate || null,
    //   status: status || "Uploaded",
    //   fileId: fileId ? new ObjectId(fileId) : null,
    //   organizationId: new ObjectId(organizationId),
    //   createdBy,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),    
    // };

    const doc = {
      title: title.trim(),
      description: (description || "").trim(),
      status: status || "Uploaded",
      fileId: fileId ? asObjId(fileId) : null,
      organizationId: asObjId(organizationId),
      recipientsMode: recipientsMode === "specific" ? "specific" : "all",
      recipients: recIds,
      dueDate: dueDate || null,
      uploadDate: uploadDate || null,      
      createdBy: asObjId(req.user.id) || String(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),    
    };

    // const result = await LetterModel.create(newLetter);
    const result = await col.insertOne(doc);

    let createdByUser = null;
    try {
      const u = await User.findById(req.user.id)
        .select("username email")
        .lean();
      if (u) {
        createdByUser = {
          id: String(u._id),
          username: u.username,
          email: u.email
        };
      }
    } catch {}
    // res.status(201).json(result);
    res.status(201).json({ _id: result.insertedId, ...doc, createdBy: String(doc.createdBy), createdByUser });
  } catch (err) {
    console.error("Create document error:", err);
    res.status(500).json({ message: "Failed to create documents" })
  }
});

// read one dokumen
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const oid = asObjId(id);
    if (!oid) {
      return res.status(400).json({ message: "Invalie id" });
    }

    const db = getDocumentDB();
    const col = LetterModel(db);

    const doc = await col.findOne({ _id: oid });
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const orgId = String(doc.organizationId);
    const { isAdmin } = await getOrgRole(req.user.id, orgId);

    const uid = String(req.user.id);
    const isAuthor = String(doc.createdBy) === uid;
    const isRecipient = doc.recipientsMode === "all" ||
    (Array.isArray(doc.recipients) && doc.recipients.map(String).includes(uid));

    if (!(isAuthor || isRecipient || isAdmin)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // join user uploader + recipients
    const idset = new Set([String(doc.createdBy), ...(doc.recipients || []).map(String)]);
    const users = await User.find({ _id: { $in: [...idset] } }, "username email").lean();
    const umap = {};
    users.forEach((u) => (umap[String(u._id)] = { id: String(u._id), username: u.username, email: u.email}));
    const payload = {
      ...doc,
      _id: String(doc._id),
      createdBy: String(doc.createdBy || ""),
      createdByUser: umap[String(doc.createdBy)] || null,
      recipientsMode: doc.recipientsMode || "all",
      recipients: (doc.recipients || []).map((r) => String(r)),
      recipientsUsers: (doc.recipients || []).map((r) => umap[String(r)]).filter(Boolean),
      // aturan: hanya penerima ATAU admin yang boleh set status, dan uploader tidak boleh
      canSetStatus: !isAuthor && (isRecipient || isAdmin),
      isAuthor,
      isRecipient,
      isAdmin
    };

    res.json(payload);
  
  } catch (err) { 
    next(err); 
  }
});

// update dokumen status
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const oid = asObjId(id);
    if (!oid) return res.status(400).json({ message: "invalid id" });

    const db = getDocumentDB();
    const col = LetterModel(db);

    const doc = await col.findOne({ _id: oid });
    if (!doc) return res.status(404).json({ message: "Not found" });

    // siapa saja yang boleh set status?
    const { isAdmin } = await getOrgRole(req.user.id, String(doc.organizationId));
    const uid = String(req.user.id);
    const isAuthor = String(doc.createdBy) === uid;
    const isRecipient = doc.recipientsMode === "all"
      || (Array.isArray(doc.recipients) && doc.recipients.map(String).includes(uid));

    // uploader TIDAK boleh set status
    if (!( !isAuthor && (isRecipient || isAdmin) )) {
      return res.status(403).json({ message: "Not allowed to update status" });
    }

    const { status, comment, approvalFileId } = req.body;

    const set = {
      updatedAt: new Date(),
    };

    if (status) set.status = status;
    if (typeof comment === "string") set.comment = comment.trim();
    if (approvalFileId) {
      const fid = asObjId(approvalFileId);
      if (!fid) return res.status(400).json({ message: "invalid approvalFileId" });
      set.approvalFileId = fid;
    }

    await col.updateOne({ _id: oid }, { $set: set });

    // balas payload seperti GET /:id (dengan flags)
    const refreshed = await col.findOne({ _id: oid });

    const idset = new Set([String(refreshed.createdBy), ...(refreshed.recipients || []).map(String)]);
    const users = await User.find({ _id: { $in: [...idset] } }, "username email").lean();
    const umap = {};
    users.forEach((u) => (umap[String(u._id)] = { id: String(u._id), username: u.username, email: u.email }));

    const payload = {
      ...refreshed,
      _id: String(refreshed._id),
      createdBy: String(refreshed.createdBy || ""),
      createdByUser: umap[String(refreshed.createdBy)] || null,
      recipientsMode: refreshed.recipientsMode || "all",
      recipients: (refreshed.recipients || []).map((r) => String(r)),
      recipientsUsers: (refreshed.recipients || []).map((r) => umap[String(r)]).filter(Boolean),
      canSetStatus: !isAuthor && (isRecipient || isAdmin),
      isAuthor,
      isRecipient,
      isAdmin,
    };

    res.json(payload);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});


// delete dokumen
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const orgId = req.query.organizationId;
    const { id } = req.params;

    if (!orgId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const oid = asObjId(id);
    const orgObjId = asObjId(orgId);
    if (!oid || !orgObjId) {
      return res.status(400).json({ message: "invalid id/orgId" });      
    }

    const db = getDocumentDB();
    const col = LetterModel(db);    

    const doc = await col.findOne({ _id: oid, organizationId: orgObjId });
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const { isAdmin } = await getOrgRole(req.user.id, orgId);
    const isAuthor = String(doc.createdBy) === String(req.user.id);
    if (!(isAdmin || isAuthor)) {
      return res.status(403).json({ message: "Only admin/owner or uploader can delete" });
    }

    await col.deleteOne({ _id: oid, organizationId: orgObjId });

    // const result = await LetterModel.deleteById(id, orgId);
    // const result = await col.deleteOne({
    //   _id: new ObjectId(id),
    //   organizationId: new ObjectId(orgId)
    // });

    // if (result.deletedCount === 0) {
    //   return res.status(403).json({ message: "Access denied or not found" })
    // }

    res.json({ message: "Deleted successfully" })
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ message: "Failed to delete document" });
  }
});

export default router;

// -----------------------------KODE LAMA-------------------------
// import { Router } from "express";
// import { getDb, getBucket } from "../services/db.js";
// import { letters } from "../models/letters.js";
// import { letterChunks } from "../models/letterChunks.js";
// import { ObjectId } from "mongodb";

// const router = Router();

// /* =========================
//    LIST DOKUMEN
//    GET /api/docs?limit=&page=
//    ========================= */
// router.get("/docs", async (req, res, next) => {
//   try {
//     const db = await getDb();
//     const lcol = letters(db);

//     const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
//     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const skip = (page - 1) * limit;

//     const [items, total] = await Promise.all([
//       lcol
//         // ⬇️ pastikan status ikut diproyeksikan
//         .find({}, { projection: { subject: 1, number: 1, date: 1, status: 1, attachments: 1, createdAt: 1, updatedAt: 1, author: 1, recipient: 1 } })
//         .sort({ updatedAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .toArray(),
//       lcol.countDocuments(),
//     ]);

//     res.json({
//       page,
//       limit,
//       total,
//       items: items.map((d) => ({
//         // ⬇️ kembalikan id sebagai string agar FE tidak jadi [object Object]
//         id: String(d._id),
//         subject: d.subject,
//         number: d.number,
//         date: d.date,
//         status: d.status, // ⬅️ perbaikan: sebelumnya salah referensi doc.status
//         author: d.author ?? null,
//         recipient: d.recipient ?? null,
//         hasPdf: !!(d.attachments && d.attachments[0]?.mime === "application/pdf"),
//         attachment: d.attachments?.[0] || null,
//         updatedAt: d.updatedAt,
//         createdAt: d.createdAt,
//       })),
//     });
//   } catch (e) {
//     next(e);
//   }
// });

// /* =========================
//    DETAIL DOKUMEN
//    GET /api/docs/:id
//    ========================= */
// router.get("/docs/:id", async (req, res, next) => {
//   try {
//     const db = await getDb();
//     const lcol = letters(db);
//     const id = req.params.id;
//     const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

//     const doc = await lcol.findOne({ _id });
//     if (!doc) return res.status(404).json({ error: "not_found" });

//     res.json({
//       _id: String(doc._id),
//       subject: doc.subject,
//       number: doc.number,
//       date: doc.date,
//       summary: doc.summary || "",
//       status: doc.status,
//       author: doc.author ?? null,
//       recipient: doc.recipient ?? null,
//       attachments: doc.attachments || [],
//       createdAt: doc.createdAt,
//       updatedAt: doc.updatedAt,
//     });
//   } catch (e) {
//     next(e);
//   }
// });

// router.put("/docs/:id", async (req, res, next) => {
//   try {
//     const db = await getDb();
//     const lcol = letters(db);

//     const id = req.params.id;
//     const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

//     const patch = req.body || {};
//     const $set = { updatedAt: new Date() };

//     if (patch.status) {
//       const norm = String(patch.status).toLowerCase().replace(/\s|_/g, "");
//       $set.status =
//         norm === "approved" || norm === "approve" ? "Approved" :
//         norm === "reject"   || norm === "rejected"? "Reject"   :
//         "On Review";
//     }
//     if (typeof patch.comment === "string") $set.comment = patch.comment;
//     if (patch.approvalFileId) {
//       $set.attachments = [{ fileId: patch.approvalFileId, mime: "application/pdf" }];
//     }

//     const result = await lcol.findOneAndUpdate(
//       { _id },
//       { $set },
//       { returnDocument: "after", returnOriginal: false }
//     );
//     console.log(result)
//     const updated = result;
//     if (!updated) return res.status(404).json({ error: "not_found" });

//     res.json({
//       _id: String(updated._id),
//       subject: updated.subject,
//       number: updated.number,
//       date: updated.date,
//       summary: updated.summary || "",
//       status: updated.status,
//       author: updated.author ?? null,
//       recipient: updated.recipient ?? null,
//       attachments: updated.attachments || [],
//       createdAt: updated.createdAt,
//       updatedAt: updated.updatedAt,
//     });
//   } catch (e) { next(e); }
// });


// ----------------------------DEFAULT KOMENTAR---------------------------
/* =========================
   UPDATE STATUS (APPROVE/REJECT/ON REVIEW)
   PATCH /api/docs/:id/status
   Body: { status, comment?, approvalFileId? }
   ========================= */
// router.patch("/docs/:id/status", async (req, res, next) => {
//   try {
//     const db = await getDb();
//     const lcol = letters(db);

//     const id = req.params.id;
//     const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

//     const { status, comment, approvalFileId } = req.body || {};
//     if (!status) return res.status(400).json({ error: "missing_status" });

//     const norm = String(status).toLowerCase().replace(/\s|_/g, "");
//     const toSave =
//       norm === "approved" || norm === "approve" ? "Approved" :
//       norm === "reject"   || norm === "rejected"? "Reject"   :
//       "On Review";

//     const $set = { status: toSave, updatedAt: new Date() };
//     if (comment) $set.comment = comment;
//     if (approvalFileId) {
//       $set.attachments = [{ fileId: approvalFileId, mime: "application/pdf" }];
//     }

//     const result = await lcol.findOneAndUpdate(
//       { _id },
//       { $set },
//       { returnDocument: "after", returnOriginal: false }
//     );
//     const updated = result.value;
//     if (!updated) return res.status(404).json({ error: "not_found" });

//     res.json({
//       _id: String(updated._id),
//       subject: updated.subject,
//       number: updated.number,
//       date: updated.date,
//       summary: updated.summary || "",
//       status: updated.status,
//       author: updated.author ?? null,
//       recipient: updated.recipient ?? null,
//       attachments: updated.attachments || [],
//       createdAt: updated.createdAt,
//       updatedAt: updated.updatedAt,
//     });
//   } catch (e) { next(e); }
// });

// -------------------------KODE LAMA--------------------------------
/* =========================
   HAPUS DOKUMEN
   DELETE /api/docs/:id
   ========================= */
// router.delete("/docs/:id", async (req, res, next) => {
//   try {
//     const db = await getDb();
//     const bucket = await getBucket();
//     const lcol = letters(db);
//     const ccol = letterChunks(db);

//     const id = req.params.id;
//     const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

//     const doc = await lcol.findOne({ _id });
//     if (!doc) return res.status(404).json({ error: "not_found" });

//     let deletedFiles = 0;
//     if (Array.isArray(doc.attachments)) {
//       for (const att of doc.attachments) {
//         if (att?.fileId) {
//           try {
//             const fid = ObjectId.isValid(att.fileId) ? new ObjectId(att.fileId) : att.fileId;
//             await bucket.delete(fid);
//             deletedFiles++;
//           } catch (e) {
//             console.warn("GridFS delete warn:", e?.message || e);
//           }
//         }
//       }
//     }

//     const chunksResult = await ccol.deleteMany({ docId: _id });
//     const docResult = await lcol.deleteOne({ _id });

//     res.json({
//       ok: true,
//       deleted: {
//         letters: docResult.deletedCount || 0,
//         letter_chunks: chunksResult.deletedCount || 0,
//         files: deletedFiles,
//       },
//     });
//   } catch (e) {
//     next(e);
//   }
// });

// export default router;
