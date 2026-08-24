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

export const readSourcesLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many source lookup requests. Please try again later.",
);

export const selectSourceLimiter = createLimiter(
  15 * 60 * 1000,
  40,
  "Too many source selection requests. Please try again later.",
);

export const removeSourceLimiter = createLimiter(
  15 * 60 * 1000,
  40,
  "Too many source removal requests. Please try again later.",
);
