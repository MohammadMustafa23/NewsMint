import { redisClient } from "../../../config/redis.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTP from "../utils/sendOTPEmail.js";

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

    const registrationData = parseRegistrationData(cachedData);

    if (!registrationData) {
      await redisClient.del(cacheKey);

      return res.status(400).json({
        success: false,
        message: "Registration session is invalid. Please register again.",
      });
    }

    // Generate New OTP
    const otp = generateOTP();

    // Update OTP
    registrationData.otp = otp;

    // Save Again (Reset 5 min expiry)
    await redisClient.set(cacheKey, registrationData, {
      ex : 300,
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
