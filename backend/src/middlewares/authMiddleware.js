import jwt from "jsonwebtoken";
import User from "../models/User.js"; // post commit 4

// post commit 4
const verifyToken = async (req, res, next) => { 
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // cek user di database
    const user = await User.findById(decoded.id).select("-password"); 
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // block deleted users
    if (user.isDeleted) {
      res.clearCookie("token"); // Hapus token yang sudah tidak valid
      return res.status(401).json({ message: "Account has been deleted" });
    }

    // simpan user info ke request
    req.user = { 
      id: user._id, 
      email: user.email,
      username: user.username 
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token invalid" });
  }
}; // batas post commit 4

// post commit 4 dikomen
// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({message: "No token, authorization denied"});

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // simpan id user ke request
//     next();
//   } catch (error) {
//     res.status(401).json({message:"Token invalid"});
//   }
// };

export default verifyToken;