const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const User = require ("../models/User");
const axios = require("axios"); 
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Simple validation
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

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
const logout = (req, res) => {
    res.clearCookie("token"); 
    res.status(200).json({message: "Logged out successfully"}); 
}; 

// Get current user 

const getMe = async(req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({message: "User not found"});

    res.status(200).json({user});
  } catch (error) {
    res.status(500).json({message: "Server error"});
  }
};

// Google login: Redirect user to Goggle's consent screen 
const googleLogin = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = { 
    redirect_uri: `http://localhost:5000/api/auth/google/callback`,
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

// Google callback: Handle the callback from Google 
const googleCallback = async (req, res) => {
  const code = req.query.code; 

  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenOptions = {
      code, 
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `http://localhost:5000/api/auth/google/callback`,
      grant_type: "authorization_code",
    }; 

    const tokenResponse = await axios.post(tokenUrl, tokenOptions, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const { id_token } = tokenResponse.data;

    const googleUser = jwt.decode(id_token);

    let user = await User.findOne({googleId: googleUser.sub});

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
      {expiresIn: "1h"}
    );

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", 
      maxAge: 3600000,
    }); 

    res.redirect("http://localhost:5173");
  } catch (error) {
    console.error("Failed to login with Google", error);
    res.redirect("http://localhost:5173/login?error=true");
  }
};

// Forgot password: send reset link to email 
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; 
    const user = await User.findOne({email}); 
    if (!user)
      return res.status(404).json({message: "User with that email not found "});

    // Generate reset token 
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 3600000 // 1 hour 

    // save token & expire to DB 
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpire; 
    await user.save();

    // create reset link 
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // setup email transport 
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Compose email 
    const mailOptions = {
      from: `"Si KOMA" <${process.env.EMAIL_USER}`,
      to: user.email,
      subject: "Password Reset - Si KOMA", 
      text: `Hi ${user.username || "User"}, \n\nYou requested a password reset. \nPlease click the link below to reset your password (valid for 1 hour:\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email. \n\nBest, \n Si KOMA Team)`,
    };

    // send email 
    await transporter.sendMail(mailOptions);

    res.status(200).json({message: "Password reset link sent to your email."});
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({message: "Server error"});
  }
};

// reset password: verify token 
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // find user by valid token (not expired)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now()},
    });

    if (!user)
      return res.status(400).json({message: "Invalid or expired token"});

    // Hash new password 
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; 

    // clear reset token fields 
    user.resetPasswordToken = undefined; 
    user.resetPassowrdExpires = undefined;

    await user.save();

    res.status(200).json({message: "Password has been reset successfully."});
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({message: "Server error"});
    
  }
};

// update profile 

const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // update username and email if any changes 
    if (username) user.username = username;
    if (email) user.email = email; 

    // if password filled, need to be hashed 
    if (password){
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
    res.status(500).json({ message: err.message });
  }
};

// delete account 

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.clearCookie("token");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
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
};