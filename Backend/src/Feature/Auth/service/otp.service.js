import { redisClient } from "../../../config/redis.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTPEmail from "../utils/sendOTPEmail.js";

export const sendOTP = async (email) => {
  // Generate OTP
  const otp = generateOTP();

  // Store OTP in Redis for 5 minutes
  await redisClient.set(`otp:${email}`, otp, {
    ex: 300,
  });
  
  // Send Email
  await sendOTPEmail(email, otp);

  return otp;
};
