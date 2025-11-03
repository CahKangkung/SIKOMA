const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({message: "No token, authorization denied"});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan id user ke request
    next();
  } catch (error) {
    res.status(401).json({message:"Token invalid"});
  }
};

module.exports = { verifyToken };