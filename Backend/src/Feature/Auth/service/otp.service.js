import redis from "../../../config/redis.js";
import generateOTP from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";

export const sendOTP = async (email) => {
  // Generate OTP
  const otp = generateOTP();

  // Store OTP in Redis for 60 seconds
  await redis.setEx(`otp:${email}`, 300, otp);
  
  // Send Email
  await sendOTPEmail(email, otp);

  return otp;
};
