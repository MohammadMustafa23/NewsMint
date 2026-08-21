import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const BACKEND_URL = process.env.BACKEND_URL;


export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// // Brevo SMTP
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_USER = process.env.EMAIL_USER;


// News Api's
export const GUARDIAN_API_KEY=process.env.GUARDIAN_API_KEY;
export const NEWSDATA_API_KEY=process.env.NEWSDATA_API_KEY;
export const GNEWS_API_KEY=process.env.GNEWS_API_KEY;


// LLM Api
export const GEMINI_API_KEY_1=process.env.GEMINI_API_KEY_1;
export const GEMINI_API_KEY_2=process.env.GEMINI_API_KEY_2;
export const GEMINI_API_KEY_3=process.env.GEMINI_API_KEY_3;



// Telegram BOT 
export const TELEGRAM_BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

// export const REDIS_URL = process.env.REDIS_URL;


