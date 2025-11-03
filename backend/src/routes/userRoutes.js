// const express = require("express");
// const {
//     register, 
//     login, 
//     logout,
//     getMe,
//     googleLogin,
//     googleCallback,
//     forgotPassword,
//     resetPassword,
//     updateProfile,
//     deleteAccount
// } = require("../controllers/userController");
// const {verifyToken} = require("../middlewares/authMiddleware");

import express from "express";
import {
    register, 
    login, 
    logout,
    getMe,
    googleLogin,
    googleCallback,
    forgotPassword,
    resetPassword,
    updateProfile,
    deleteAccount
} from "../controllers/userController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route handles (endpoints) for authentification
router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

// Protected route
router.get("/me", verifyToken, getMe);

// --- New Google OAuth Routes (Manual) ---
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// forgot password 
router.post("/forgot-password", forgotPassword);

// reset password 
router.post("/reset-password/:token", resetPassword);
// module.exports = router;

// update user profile (protected)
router.put("/update", verifyToken, updateProfile);

// delete user account (protected)
router.delete("/delete", verifyToken, deleteAccount);

export default router;