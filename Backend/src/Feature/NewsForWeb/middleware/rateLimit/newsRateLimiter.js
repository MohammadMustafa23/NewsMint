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

export const personalizedNewsLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  "Too many news feed requests. Please try again later.",
);
