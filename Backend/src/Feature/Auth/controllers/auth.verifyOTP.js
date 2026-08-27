import User from "../models/user.model.js";
import { redisClient } from "../../../config/redis.js";

const parseRegistrationData = (cachedData) => {
  if (!cachedData) {
    return null;
  }

  if (typeof cachedData === "string") {
    try {
      return JSON.parse(cachedData);
    } catch {
      return null;
    }
  }

  return cachedData;
};

async function VerifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    // 1. Get Redis Data
    const cacheKey = `register:${email}`;

    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found.",
      });
    }

    // 2. Parse Redis data
    const userData = parseRegistrationData(cachedData);

    if (!userData) {
      await redisClient.del(cacheKey);

      return res.status(400).json({
        success: false,
        message: "Registration session is invalid. Please register again.",
      });
    }

    // 3. Compare OTP
    if (userData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // 4. Create User
    const user = await User.create({
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
    });

    // 5. Delete Redis Data
    await redisClient.del(cacheKey);

    // 6. Success
    return res.status(201).json({
      success: true,
      message: "User Registration successfully.",
    });
  } catch (error) {
    console.error("VerifyOTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export { VerifyOTP };
