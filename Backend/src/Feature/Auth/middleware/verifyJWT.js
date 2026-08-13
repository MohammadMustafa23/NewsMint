import jwt from "jsonwebtoken";
import User from "../../../models/user.model.js";
import { redisClient } from "../../../config/redis.js";

const verifyJWT = async (req, res, next) => {
  try {
    // Read token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    // ==========================
    // Check Redis Cache
    // ==========================
    const cachedUser = await redisClient.get(`user:${userId}`);

    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // ==========================
    // Fetch from MongoDB
    // ==========================
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================
    // Save to Redis (1 Hour)
    // ==========================
    await redisClient.set(`user:${userId}`, user.toObject(), {
      ex: 60 * 60, // 1 hour
    });

    req.user = user;

    next();
  } catch (error) {
    console.error("verifyJWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default verifyJWT;