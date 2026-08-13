import rateLimit from "express-rate-limit";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

/* ==========================
   AUTH RATE LIMITERS
========================== */

export const registerLimiter = createLimiter(
  60 * 60 * 1000, // 1 Hour
  5,
  "Too many registration attempts. Please try again in 1 hour.",
);

export const loginLimiter = createLimiter(
  15 * 60 * 1000, // 15 Minutes
  5,
  "Too many login attempts. Please try again in 15 minutes.",
);

export const otpLimiter = createLimiter(
  15 * 60 * 1000, // 15 Minutes
  10,
  "Too many OTP verification attempts. Please try again later.",
);

export const resendOtpLimiter = createLimiter(
  10 * 60 * 1000, // 10 Minutes
  3,
  "OTP resend limit reached. Please wait 10 minutes.",
);

export const forgotPasswordLimiter = createLimiter(
  30 * 60 * 1000, // 30 Minutes
  3,
  "Too many password reset requests. Please try again later.",
);

export const resetPasswordLimiter = createLimiter(
  30 * 60 * 1000, // 30 Minutes
  5,
  "Too many password reset attempts. Please try again later.",
);

export const googleLimiter = createLimiter(
  15 * 60 * 1000, // 15 Minutes
  10,
  "Too many Google login attempts. Please try again later.",
);
