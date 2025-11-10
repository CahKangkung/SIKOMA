import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import axios from "axios";
import crypto from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose"; // post commit 4
import Organization from "../models/Organization.js"; // post commit 4
import { getUserDB, getDocumentDB } from "../services/db.js"; // post commit 4
import { MongoClient } from "mongodb"; // post commit 4
import { ObjectId } from "mongodb"; // post commit 4

// ======================= REGISTER =======================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= LOGIN =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true only when using HTTPS
      sameSite: "lax",
      maxAge: 3600000, // 1 jam
    });

    res.status(200).json({
      message: "Login successful",
      // user: { id: user._id, username: user.username, email: user.email }, // lama
      user: { id: user._id.toString(), _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================= LOGOUT =======================
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// ======================= GET CURRENT USER =======================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // res.status(200).json({ user }); //lama
    res.status(200).json({ 
      user: {
        id: user._id.toString(), // ✅ Tambah field "id"
        _id: user._id,
        username: user.username,
        email: user.email,
        googleId: user.googleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= GOOGLE LOGIN =======================
export const googleLogin = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.CLIENT_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
};

// ======================= GOOGLE CALLBACK =======================
export const googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenOptions = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.CLIENT_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    };

    const tokenResponse = await axios.post(tokenUrl, tokenOptions, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { id_token } = tokenResponse.data;
    const googleUser = jwt.decode(id_token);

    let user = await User.findOne({ googleId: googleUser.sub });
    if (!user) {
      user = await User.create({
        googleId: googleUser.sub,
        email: googleUser.email,
        username: googleUser.name,
      });
    }

    // post commit 4
    if (user.isDeleted) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=account_deleted`);
    } // batas post commit 4

    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: false, // Set to true only when using HTTPS
      sameSite: "lax",
      maxAge: 3600000,
    });

    // res.redirect(`${process.env.CLIENT_URL}/home`); post commit 4 dikomen
    res.redirect(`${process.env.CLIENT_URL}/auth/callback`); // post commit 4
  } catch (error) {
    console.error("Failed to login with Google", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=true`);
  }
};

// ======================= FORGOT PASSWORD =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User with that email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 3600000; // 1 jam
    // const resetTokenExpire = Date.now() + 10000000; // 1 jam

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpire;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${encodeURIComponent(resetToken)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Si KOMA" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset - Si KOMA",
      text: `Hi ${user.username || "User"},\n\nClick below to reset your password:\n${resetLink}\n\nThis link is valid for 1 hour.\n\nBest,\nSi KOMA Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= RESET PASSWORD =======================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= UPDATE PROFILE =======================
export const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ======================= DELETE ACCOUNT =======================
// post commit 4
export const deleteAccount = async (req, res) => {
  // ✅ Session hanya untuk Mongoose operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ SOFT DELETE
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.username = `[deleted_${userId}]`;
    user.email = `deleted_${userId}@deleted.com`;
    await user.save({ session });

    // 1️⃣ Hapus join requests
    await Organization.updateMany(
      { "joinRequests.user": userId },
      { $pull: { joinRequests: { user: userId } } },
      { session }
    );

    // 2️⃣ Hapus dari members
    await Organization.updateMany(
      { "members.user": userId },
      { $pull: { members: { user: userId } } },
      { session }
    );

    // 3️⃣ Handle owned organizations
    const ownedOrgs = await Organization.find({ createdBy: userId }).session(session);

    for (const org of ownedOrgs) {
      const otherMembers = org.members.filter(
        m => String(m.user) !== String(userId)
      );

      if (otherMembers.length > 0) {
        // Transfer ownership
        const newOwner = otherMembers[0].user;
        org.createdBy = newOwner;

        const memberIndex = org.members.findIndex(
          m => String(m.user) === String(newOwner)
        );
        if (memberIndex !== -1) {
          org.members[memberIndex].role = "admin";
        }

        await org.save({ session });
      } else {
        // ✅ Hapus organisasi (dalam session)
        await Organization.findByIdAndDelete(org._id).session(session);
      }
    }

    // ✅ Commit transaction Mongoose dulu
    await session.commitTransaction();

    // ✅ SETELAH commit, hapus documents (tanpa transaction)
    // Ini aman karena:
    // 1. User sudah soft deleted (tidak bisa login lagi)
    // 2. Org sudah dihapus (tidak bisa diakses)
    // 3. Worst case: dokumen orphan (tapi user/org sudah gone)
    const db = getDocumentDB();
    const orgIds = ownedOrgs
      .filter(org => org.members.filter(m => String(m.user) !== String(userId)).length === 0)
      .map(org => new ObjectId(org._id));

    if (orgIds.length > 0) {
      await db.collection("letters").deleteMany({
        organizationId: { $in: orgIds }
      });

      await db.collection("letter_chunks").deleteMany({
        organizationId: { $in: orgIds }
      });
    }

    res.clearCookie("token");
    res.status(200).json({
      message: "Account deleted successfully",
      affectedOrganizations: ownedOrgs.length
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Delete account error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


// export const deleteAccount = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.user.id);
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     res.clearCookie("token");
//     res.status(200).json({ message: "Account deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

