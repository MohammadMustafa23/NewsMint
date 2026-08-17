import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// // Brevo SMTP
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_USER = process.env.EMAIL_USER;


// News Api's
export const GUARDIAN_API_KEY="0518d990-83fb-422f-a245-bea279620616";
export const NEWSDATA_API_KEY="pub_667d8b4ea42242468040225beed5eeb5";
export const GNEWS_API_KEY="4e2e53dd2762a3224f8ca2b0ebbe2402";


// export const REDIS_URL = process.env.REDIS_URL;
// export const YT_COOKIES_PATH = process.env.YT_COOKIES_PATH;


