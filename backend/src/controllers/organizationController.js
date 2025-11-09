import express from "express";
import Organization from "../models/Organization.js";
import { getDocumentDB } from "../services/db.js";
import { ObjectId } from "mongodb";

// ======================= CREATE ORG =======================
export const createOrg = async (req, res) => {
    try {
        const { name, description } = req.body;
        //const userId = new mongoose.Types.ObjectId(req.user._id);
        const userId = req.user.id;

        // Validasi jika nama organisasi sudah ada
        const existingOrg = await Organization.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i')}
        });

        if (existingOrg) {
            return res.status(400).json({ error: "Organization name already exists" });
        }

        const newOrg = new Organization({
            name,
            description,
            createdBy: userId,
            members: [{ 
                user: userId, 
                role: "admin"
            }],
        });

        await newOrg.save();
        res.status(201).json({ message: "Organization created", newOrg });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= EDIT ORG =======================
export const editOrg =  async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, description } = req.body;
        const org = await Organization.findById(id);

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Memastikan hanya owner yang bisa
        if (String(org.createdBy) !== String(userId)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Validasi jika nama organisasi sudah ada
        const existingOrg = await Organization.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i')},
            _id: { $ne: id }
        });
        if (existingOrg) {
            return res.status(400).json({ error: "Organization name already exist" });
        }

        org.name = name;
        org.description = description;
        await org.save();
        res.json({ message: "Organization updated successfully", org });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= DELETE ORG =======================
export const deleteOrg = async (req, res) => {
    try {
        const orgId = req.params.id;
        const userId = req.user.id;
        const org = await Organization.findById(orgId);

        if (!org) {
            return res.status(400).json({ error: "Organization not found" });
        }

        // Cek apakah user adalah pemilik organisasi
        if (org.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Only owner can delete this organization" });
        }

        //Cek apakah member masih ada di organisasi selain pemilik
        const otherMembers = org.members.filter((member) => member.user.toString() !== org.createdBy.toString());

        if (otherMembers.length > 0) {
            return res.status(400).json({error: "Cannot delete organization while member still exist"});
        }

        const orgName = org.name;
        await org.deleteOne();
        res.json({ message: "Organization deleted successfully", name: orgName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= AVAILABLE ORG =======================
export const availableOrg = async (req, res) => {
    try {
        const userId = req.user.id;

        /* const orgs = await Organization.find({
            "members.user": { $ne: userId } // Cari semua organisasi yang tidak memiliki anggota dengan userId ini.
        })
            .select("-members") // opsional: hide members list
            .populate("createdBy", "username email"); // ambil name dari pembuat organisasi
        */ // post commit 4 comment

        const orgs = await Organization.find({
            $and: [
                { "members.user": { $ne: userId } },        // belum jadi member
                { "joinRequests.user": { $ne: userId } }    // belum pernah request
            ]
        })
            .select("-members -joinRequests")
            .populate("createdBy", "username email");

        res.json(orgs);
    
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= MY/USER ORG =======================
export const myOrg = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil semua organisasi agar bisa difilter di sisi server
        // const allOrgs = await Organization.find({ "members.user": userId })
        const allOrgs = await Organization.find()
            .populate("createdBy", "username email")
            .populate("members.user", "username email")
            .populate("joinRequests.user", "username email"); // tambahan untuk joinRequests

        // Filter orgs dimana user adalah pembuat
        const created = allOrgs.filter((org) => String(org.createdBy?._id) === String(userId));

        // Filter orgs dimana user adalah member
        const joined = allOrgs.filter((org) => org.members.some((m) => 
            String(m.user?._id) === String(userId) &&
            String(org.createdBy?._id) !== String(userId)
        ));
        
        // Filter orgs dimana user masih wait approval
        const pending = allOrgs.filter((org) => org.joinRequests.some((r) => String(r.user?._id) === String(userId)));

        // Filter semua orgs
        const all = [...new Set([...created, ...joined, ...pending])];

        // res.json(allOrgs);
        res.json({all, created, joined, pending}); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= JOIN ORG =======================
export const joinOrg = async (req, res) => {
    try {
        const orgId = req.params.id;
        const userId = req.user.id;

        const org = await Organization.findById(orgId);
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // to check if already member of the organization
        const alreadyMember = org.members.some(m => String(m.user) === String(userId));
        if (alreadyMember) {
            return res.status(400).json({ error: "Already a member" });
        }

        // Cegah user untuk join
        const alrRequested = org.joinRequests.some((r) => String(r.user) === String(userId));
        if (alrRequested) {
            return res.status(400).json({ error: "Already requested" });
        }

        // Tambah ke daftar join request
        org.joinRequests.push({ user: userId });
        await org.save();

        res.json({ message: "Join request sent. Waiting for approval", organization: org });

        // org.members.push({ user: userId, role: "member" });
        // await org.save();

        // res.json({ message: "Success joined organization", organization: org });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= LEAVE ORG =======================
export const leaveOrg = async (req, res) => {
    try {
        const orgId = req.params.id;
        const userId = req.user.id;

        const org = await Organization.findById(orgId);
        if (!org) {
            res.status(404).json({ error: "Organization not found" });
        }

        // Cek apakah user adalah owner
        if (org.createdBy.toString() === userId.toString()) {
            return res.status(403).json({ error: "Owner cannot leave their own organization" });
        }

        org.members = org.members.filter(m => String(m.user) !== String(userId));
        await org.save();

        res.json({ message: "Left organization" })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= PENDING ORG =======================
export const pendingOrg = async (req, res) => {
    try {
        // Mencari organisasi dengan id
        const { id } = req.params;
        const userId = req.user.id;
        const org = await Organization.findById(id)
            .populate("joinRequests.user", "username email");
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Hanya creator yang boleh lihat
        if (String(org.createdBy) !== String(userId)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.json(org.joinRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= CANCEL PENDING ORG =======================
export const cancelOrg = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const org = await Organization.findById(id);
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Delete user dari list pending
        org.joinRequests = org.joinRequests.filter((r) => String(r.user) !== String(userId))
        await org.save();

        res.json({ message: "Join request canceled successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= APPROVE USER =======================
export const approveUser = async (req, res) => {
    try {
        // Mencari organisasi dengan id
        const { id, userId } = req.params;
        const org = await Organization.findById(id);
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Hanya creator yang boleh approve
        if (String(org.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Cari request user di daftar joinRequests
        const requestIndex = org.joinRequests.findIndex(
            (r) => String(r.user) === String(userId)
        );
        if (requestIndex === -1) {
            return res.status(404).json({ error: "Request not found" });
        }

        // Transisikan ke member
        org.members.push({user: userId, role: "member"});
        org.joinRequests.splice(requestIndex, 1);

        await org.save();
        res.json({ message: "User approved and added as member" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= REJECT USER =======================
export const rejectUser = async (req, res) => {
    try {
        // Mencari organisasi dengan id
        const { id, userId } = req.params;
        const org = await Organization.findById(id);
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Hanya creator yang boleh reject
        if (String(org.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Hapus request tanpa ditambah ke member
        org.joinRequests = org.joinRequests.filter(
            (r) => String(r.user) !== String(userId)
        );
        
        await org.save();
        res.json({ message: "User rejected as member" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= MEMBER ORG LIST =======================
export const memberList = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await Organization.findById(id)
            .populate("members.user", "username email")
            .populate("createdBy", "username email")

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        res.json({
            name: org.name,
            createdBy: org.createdBy,
            members: org.members,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

// ======================= DELETE MEMBER ORG =======================
export const deleteMember = async (req, res) => {
    try {
        console.log("🧩 Params:", req.params);
        console.log("🧑 req.user:", req.user);
        
        const { id, memberId } = req.params;
        const userId = req.user.id;
        const org = await Organization.findById(id);

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Cek apakah user adalah owner
        if (String(org.createdBy) !== String(userId)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Cegah owner untuk hapus organisasi
        if (String(org.createdBy) === String(memberId)) {
            return res.status(400).json({ error: "You cannot remove yourself as author"});
        }

        // Periksa jika member ada di organisasi
        const memberExists = org.members.some((m) => String(m.user) === String(memberId));
        if (!memberExists) {
            return res.status(404).json({ error: "Member not found in this organization" });
        }

        // Hapus member dari organisasi
        org.members = org.members.filter((m) => String(m.user) !== String(memberId));

        await org.save();
        
        // Populate agar frontend dapat langsung dipakai
        await org.populate("members.user", "username email");

        res.json({ message: "Member removed successfully", members: org.members });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
};

// ======================= TRANSFER ADMIN ORG =======================
export const transferAdmin = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const userId = req.user.id;
        const { confirmation } = req.body;
        const org = await Organization.findById(id)
            .populate("members.user", "username email");

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Memastikan bahwa user yang transfer adalah pemilik
        if (String(org.createdBy) !== String(userId)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Memastikan confirmation benar
        if (confirmation?.toLowerCase() !== "confirm") {
            return res.status(400).json({ error: "You must type 'confirm' to proceed" })
        }

        // Memastikan bahwa memberId adalah anggota organisasi
        const memberToTransfer = org.members.find((m) => String(m.user._id) === String(memberId));
        if (!memberToTransfer) {
            return res.status(404).json({ error: "Target member not found in this organization" });
        }

        // Transfer createdBy ke member
        org.createdBy = memberId;

        // Update role masing-masing anggota
        org.members = org.members.map((m) => {
            if (String(m.user._id) === memberId) {
                return { ...m.toObject(), role: "admin" }; // penerima menjadi admin
            }
            if (String(m.user._id) === String(req.user.id)) {
                return { ...m.toObject(), role: "member" };
            }
            return m;
        });

        await org.save();
        res.json({ message: "Ownership Transfer Successfully", org });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= GET ORG =======================
export const getOrg = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id)
            .populate("createdBy", "username email")
            .populate("members.user", "username email");

        if (!org) {
            return res.status(404).json({ error: "Organization not found"});
        }

        res.json(org);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

// ======================= ORG DASHBOARD STATS =======================
export const getOrgDashboardStats = async (req, res) => {
  const where = "[getOrgDashboardStats]";
  try {
    const { id } = req.params;

    // ---- Guard req.user ----
    if (!req.user || !(req.user.id || req.user._id)) {
      console.error(where, "Missing req.user. Did authMiddleware run?");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ---- IDs ----
    const orgObjId = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const userIdStr = String(req.user.id || req.user._id);
    const userObjId = ObjectId.isValid(userIdStr) ? new ObjectId(userIdStr) : null;

    // ---- DB / collection ----
    const db = getDocumentDB();
    if (!db) {
      console.error(where, "getDocumentDB() returned null/undefined");
      return res.status(500).json({ error: "DB not initialized" });
    }
    const lettersCol = db.collection("letters");

    // ------------------------------------------------------------------
    // CHANGED: Ambil info organisasi & tentukan role SEBELUM membangun baseMatch
    // ------------------------------------------------------------------
    const org = await Organization.findById(orgObjId)
      .populate("createdBy", "username email")
      .populate("members.user", "username email")
      .lean();

    if (!org) {
      console.error(where, "Organization not found:", id);
      return res.status(404).json({ error: "Organization not found" });
    }

    let role = "member";
    const isOwner = String(org.createdBy?._id || org.createdBy) === userIdStr;
    if (isOwner) role = "admin";
    else if (Array.isArray(org.members)) {
      const me = org.members.find((m) => String(m.user?._id || m.user) === userIdStr);
      if (me?.role) role = me.role;
    }

    // ------------------------------------------------------------------
    // CHANGED: Bangun baseMatch berdasarkan role
    // - Admin: lihat semua dokumen di organisasi (tanpa filter uploader/recipient)
    // - Member: filter seperti sebelumnya (saya pengunggah / saya penerima / publik ke org)
    //   Disederhanakan agar tidak duplikatif & lebih aman untuk array/scalar
    // ------------------------------------------------------------------
    let baseMatch;
    const idCandidates = [userIdStr, userObjId].filter(Boolean); // ["stringId", ObjectId] jika ada

    if (role === "admin") {
      baseMatch = {
        organizationId: orgObjId,
        // Jika ada soft-delete/arsip di skema Anda, pertimbangkan menambah filter di sini.
        // deletedAt: { $exists: false },
      };
    } else {
      baseMatch = {
        organizationId: orgObjId,
        $or: [
          { createdBy: { $in: idCandidates } },
          { recipients: { $in: idCandidates } }, // cocok untuk field array ataupun scalar
          { recipientsMode: "all" },              // visibilitas ke seluruh organisasi
        ],
      };
    }

    console.log(where, "orgId:", id, "user:", userIdStr, "role:", role);
    console.log(where, "baseMatch:", JSON.stringify(baseMatch));

    // ---- Aggregation (tidak berubah) ----
    const byStatus = await lettersCol
      .aggregate([
        { $match: baseMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();

    console.log(where, "byStatus:", byStatus);

    // ---- Map counts (tetap) ----
    const counts = { uploaded: 0, onReview: 0, approved: 0, rejected: 0 };
    const mapKey = (k) => {
      const norm = String(k ?? "").toLowerCase();
      if (["on_review", "review", "onreview", "pending_review", "on review"].includes(norm)) return "onReview";
      if (["approved", "approve", "accepted"].includes(norm)) return "approved";
      if (["rejected", "reject", "declined"].includes(norm)) return "rejected";
      if (["uploaded", "upload", "draft", "new"].includes(norm)) return "uploaded";
      return null;
    };
    for (const row of byStatus) {
      const key = mapKey(row?._id);
      if (key) counts[key] = row?.count ?? 0;
    }

    // ---- Response payload (role sudah dihitung di atas) ----
    const payload = {
      organization: {
        id: String(org._id),
        name: org.name,
        author: org.createdBy?.username || org.createdBy?.email || String(org.createdBy),
        totalMembers: org.members?.length ?? 0,
        role,
      },
      stats: counts,
    };

    console.log(where, "response:", payload);
    return res.json(payload);
  } catch (err) {
    console.error("[getOrgDashboardStats] ERROR:", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
};

// ======================= GET ALL ORG =======================
// const listAllOrg = async (req, res) => {
//     try {
//         const orgs = await Organization.find().populate("createdBy", "name");
//         res.json(orgs);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

