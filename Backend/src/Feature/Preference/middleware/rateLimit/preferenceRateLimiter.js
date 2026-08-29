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

export const savePreferencesLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  "Too many preference save requests. Please try again later.",
);

export const readPreferencesLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many preference read requests. Please try again later.",
);

export const updatePreferencesLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  "Too many preference update requests. Please try again later.",
);
