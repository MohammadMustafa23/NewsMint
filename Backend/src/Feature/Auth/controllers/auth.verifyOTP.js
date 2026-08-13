import User from "../../../models/user.model.js";
import { redisClient } from "../../../config/redis.js";
import UserPreference from "../../Preferences/models/preferences.model.js";


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

    

    // 2. Parse Redis Data
    const userData = cachedData;

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

    await UserPreference.create({
      userId: user._id,
    });

    // 6. Success
    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export { VerifyOTP };
