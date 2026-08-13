import dotenv from "dotenv";
dotenv.config();

export const PORT = 3000;
export const REDIS_URL = process.env.REDIS_URL;

export const EMAIL_USER = process.env.EMAIL_USER;

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Brevo SMTP
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const YT_COOKIES_PATH = process.env.YT_COOKIES_PATH;

