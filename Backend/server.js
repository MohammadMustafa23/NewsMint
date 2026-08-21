import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.connection.js";
import { connectRedis } from "./src/config/redis.js";
import startTelegramPolling from "./src/TelegramBOT/service/telegram.service.js";
import startDigestScheduler from "./src/Scheduler/digest.scheduler.js"
import { PORT } from "./src/config/env.js";
import { processDueUsers } from "./src/Scheduler/digest.scheduler.js";

// Mongo DB Connection Check
connectDB();

// Redis Connection
connectRedis();

app.listen(PORT, async () => {
  console.log("🚀 Server Running on Port", PORT);
  startTelegramPolling();

  await processDueUsers(); // Call the function to process due users on server start
  startDigestScheduler();
});

