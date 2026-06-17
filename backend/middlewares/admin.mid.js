import jwt from 'jsonwebtoken';
import config from '../config.js';

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    req.adminId = decoded.id;

    next();
  } catch (error) {
    console.log("Error in verifying token", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify token or expired. Please login again.",
    });
  }
}

export default adminMiddleware;