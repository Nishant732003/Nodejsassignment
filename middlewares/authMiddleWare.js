const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded.userId) {
      throw new Error("Token does not contain user ID");
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authMiddleware;
