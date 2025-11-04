import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import axios from "axios";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
      secure: process.env.NODE_ENV === "production", // pakai https di production
      sameSite: "lax", // biar bisa dikirim antara localhost:8080 dan 5173
      maxAge: 3600000, // 1 jam
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
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

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= GOOGLE LOGIN =======================
export const googleLogin = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: "http://localhost:8080/api/auth/google/callback",
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

export const googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenOptions = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:8080/api/auth/google/callback",
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

    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    res.redirect("http://localhost:5173/home");
  } catch (error) {
    console.error("Failed to login with Google", error);
    res.redirect("http://localhost:5173/login?error=true");
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
    // const resetTokenExpire = Date.now() + 3600000; // 1 jam
    const resetTokenExpire = Date.now() + 10000000; // 1 jam

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpire;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

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
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.clearCookie("token");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

