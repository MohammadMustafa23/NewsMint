import dotenv from "dotenv";

dotenv.config();

// ======================================================
// ENVIRONMENT VALIDATION
// ======================================================

const requiredEnv = [
  // App
  "PORT",
  "BACKEND_URL",

  // Database
  "MONGO_URI",

  // Redis
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",

  // Auth
  "JWT_SECRET",

  // SMTP
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",

  // News APIs
  "MEDIASTACK_API_KEY",
  "NEWSDATA_API_KEY",
  "GNEWS_API_KEY",

  // Gemini
  "GEMINI_API_KEY_1",
  "GEMINI_API_KEY_2",
  "GEMINI_API_KEY_3",

  // Telegram
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_BOT_USERNAME",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variables:\n${missingEnv.join("\n")}`,
  );

  process.exit(1);
}

// ======================================================
// APP
// ======================================================

export const PORT = process.env.PORT || 5000;

export const MONGO_URI = process.env.MONGO_URI;

export const BACKEND_URL = process.env.BACKEND_URL;

// ======================================================
// REDIS
// ======================================================

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ======================================================
// AUTH
// ======================================================

export const JWT_SECRET = process.env.JWT_SECRET;

// ======================================================
// SMTP
// ======================================================

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_USER = process.env.EMAIL_USER;

// ======================================================
// NEWS APIs
// ======================================================

export const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;

export const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

export const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// ======================================================
// LLM APIs
// ======================================================

export const GEMINI_API_KEY_1 = process.env.GEMINI_API_KEY_1;

export const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2;

export const GEMINI_API_KEY_3 = process.env.GEMINI_API_KEY_3;

// ======================================================
// TELEGRAM
// ======================================================

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;
