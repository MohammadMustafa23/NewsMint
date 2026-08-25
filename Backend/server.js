import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";

import connectDB from "./src/db/db.connection.js";
import { connectRedis } from "./src/config/redis.js";
import startTelegramPolling from "./src/TelegramBOT/service/telegram.service.js";
import startDigestScheduler from "./src/Scheduler/digest.scheduler.js";
import { processDueUsers } from "./src/Scheduler/digest.scheduler.js";
import startNewsScheduler from "./src/Scheduler/news.scheduler.js";

import { PORT } from "./src/config/env.js";

const startServer = async () => {
  try {
    // -----------------------------
    // Connect MongoDB
    // -----------------------------

    await connectDB();

    console.log("✅ MongoDB connected");

    // -----------------------------
    // Connect Redis
    // -----------------------------

    await connectRedis();

    console.log("✅ Redis connected");

    // -----------------------------
    // Start HTTP Server
    // -----------------------------

    app.listen(PORT, async () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
      // Telegram
      startTelegramPolling();

      // Process due digests once on startup
      await processDueUsers();

      // Start digest scheduler
      startDigestScheduler();

      // Start news scheduler
      startNewsScheduler();
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
