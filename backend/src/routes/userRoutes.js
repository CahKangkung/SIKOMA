const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  googleLogin,
  googleCallback,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteAccount,
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// User info
router.get("/me", verifyToken, getMe);

// Google OAuth
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile management (protected)
router.put("/update", verifyToken, updateProfile);
router.delete("/delete", verifyToken, deleteAccount);

module.exports = router;
