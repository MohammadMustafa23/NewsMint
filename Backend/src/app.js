import express, { json } from "express";
import AuthRouter from "./Feature/Auth/routes/auth.routes.js";
import PreferenceRoute from "./Feature/Prefrence/routes/preference.route.js";
import SourceRoute from "./Feature/NewsSource/routes/source.route.js";
import TelegramRoute from "./TelegramBOT/routes/telegram.route.js";
import NewsRoute from "./Feature/NewsForWeb/routes/news.route.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { redisClient } from "./config/redis.js";

// import helmet from "helmet";
import cors from "cors";

const app = express();
const allowedOrigins = process.env.FRONTEND_CLIENT_ID
  ? process.env.FRONTEND_CLIENT_ID.split(",").map((origin) => origin.trim())
  : [];

// // Trust Render's reverse proxy so req.ip / X-Forwarded-For
// app.set("trust proxy", 1);

// app.use(
//   helmet({
//     crossOriginOpenerPolicy: false,
//     crossOriginResourcePolicy: {
//       policy: "cross-origin",
//     },
//   }),
// );

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// That is For Check IsServer Alive
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "NewsMint API is healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// That is Load Balancer Check This First Then Send Requst
app.get("/ready", async (req, res) => {
  try {
    // MongoDB check
    const mongoReady = mongoose.connection.readyState === 1;

    if (!mongoReady) {
      return res.status(503).json({
        success: false,
        status: "NOT_READY",
        message: "MongoDB is not connected.",
        timestamp: new Date().toISOString(),
      });
    }

    // Redis check
    await redisClient.ping();

    return res.status(200).json({
      success: true,
      status: "READY",
      message: "NewsMint API is ready.",
      services: {
        mongodb: "connected",
        redis: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Readiness Check Failed:", error.message);

    return res.status(503).json({
      success: false,
      status: "NOT_READY",
      message: "Required services are unavailable.",
      services: {
        mongodb:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        redis: "disconnected",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api", AuthRouter);
app.use("/api/preferences", PreferenceRoute);
app.use("/api/sources", SourceRoute);
app.use("/api/telegram", TelegramRoute);
app.use("/api/news", NewsRoute);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});



app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
