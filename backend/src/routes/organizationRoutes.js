import express from "express";
// import mongoose from "mongoose";
import { 
    createOrg,
    editOrg,
    deleteOrg,
    availableOrg,
    myOrg,
    joinOrg,
    leaveOrg,
    pendingOrg,
    cancelOrg,
    approveUser,
    rejectUser,
    memberList,
    deleteMember,
    transferAdmin,
    getOrg, getOrgDashboardStats 
} from "../controllers/organizationController.js";

const router = express.Router();

// Create new organization
router.post("/create", createOrg);

// Edit organization atribute
router.put("/:id/edit", editOrg);

// Delete organization
router.delete("/:id/delete", deleteOrg);

// Get available join organization
router.get("/available", availableOrg);

// Get organization where user is a member of (owned or joined)
router.get("/my", myOrg);

// Join organization
router.post("/:id/join", joinOrg);

// Leave organization
router.post("/:id/leave", leaveOrg);

// Pending join request to organization
router.get("/:id/requests", pendingOrg);

// Cancel join request
router.post("/:id/cancel", cancelOrg);

// Approve join request
router.post("/:id/approve/:userId", approveUser);

// Reject join request
router.post("/:id/reject/:userId", rejectUser);

// Member organization list
router.get("/:id/members", memberList);

// Delete member organization
router.delete("/:id/members/:memberId", deleteMember);

// Transfer admin to member
router.put("/:id/transfer/:memberId", transferAdmin);

// Get organization id
router.get("/:id", getOrg);

// Get all organization
// router.get("/all", allOrg);

// Get organization dashboard stats
router.get("/:id/stats", getOrgDashboardStats);

export default router;