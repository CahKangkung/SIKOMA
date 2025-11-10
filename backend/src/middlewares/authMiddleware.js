// src/middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

/** Ambil token dari Authorization: Bearer <token>, cookie "token", atau ?token= */
export function extractToken(req) {
  // Header
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (h && typeof h === "string") {
    const [scheme, token] = h.split(" ");
    if (/^Bearer$/i.test(scheme) && token) return token.trim();
  }
  // Cookie (butuh cookie-parser)
  if (req.cookies?.token) return req.cookies.token;
  // Query (untuk testing)
  if (req.query?.token) return req.query.token;
  return null;
}

/** Muat user dari DB + validasi status */
async function loadUserOrThrow(uid) {
  const user = await User.findById(uid)
    .select("_id email username role status isDeleted")
    .lean();

  if (!user) {
    const err = new Error("User not found");
    err.code = 401;
    throw err;
  }
  if (user.isDeleted) {
    const err = new Error("Account has been deleted");
    err.code = 401;
    throw err;
  }
  return user;
}

/** Bentuk objek req.user standar untuk seluruh controller */
function shapeReqUser(user) {
  return {
    id: String(user._id), // string id
    _id: user._id,        // ObjectId (berguna saat native driver)
    email: user.email,
    username: user.username,
    role: user.role,      // role global aplikasi
    status: user.status,  // opsional
  };
}

/** Auth wajib: 401 jika tidak ada/invalid */
export async function auth(req, res, next) {
  const where = "[auth]";
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    if (!JWT_SECRET) {
      console.error(where, "Missing JWT_SECRET env");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    // Terima payload dengan sub/id/_id/userId (fleksibel)
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    const uid = String(payload.sub || payload.id || payload._id || payload.userId || "");

    if (!uid) return res.status(401).json({ error: "Invalid token" });

    const user = await loadUserOrThrow(uid);

    req.user = shapeReqUser(user);
    res.locals.user = req.user;

    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err?.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalid" });
    }
    const code = Number(err?.code) || 401;
    if (code >= 400 && code < 500) {
      return res.status(code).json({ error: err.message || "Unauthorized" });
    }
    console.error("[auth]", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/** Auth opsional: tidak melempar 401 jika token tidak ada/invalid */
export async function optionalAuth(req, res, next) {
  try {
    if (!JWT_SECRET) return next();

    const token = extractToken(req);
    if (!token) return next();

    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    const uid = String(payload.sub || payload.id || payload._id || payload.userId || "");
    if (!uid) return next();

    const user = await loadUserOrThrow(uid);
    req.user = shapeReqUser(user);
    res.locals.user = req.user;
  } catch {
    // abaikan error token pada optional auth
  } finally {
    next();
  }
}

// Backward compatibility:
// - Ada kode lama yang mengimpor default verifyToken atau named verifyToken.
// - Kita samakan perilakunya dengan `auth`.
export const verifyToken = auth;
export default auth;
