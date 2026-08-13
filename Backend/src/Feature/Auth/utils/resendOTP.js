import { redisClient } from "../../../config/redis.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTP from "../utils/sendOTPEmail.js";

async function ResendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Redis Key
    const cacheKey = `register:${email}`;

    // Get Registration Data
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) {
      return res.status(400).json({
        success: false,
        message: "Registration session expired. Please register again.",
      });
    }

    // Parse Redis Data
    const userData = JSON.parse(cachedData);

    // Generate New OTP
    const otp = generateOTP();

    // Update OTP
    userData.otp = otp;

    // Save Again (Reset 5 min expiry)
    await redisClient.set(cacheKey, JSON.stringify(userData), {
      EX: 300,
    });

    // Send New OTP
    await sendOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}

export { ResendOTP };
