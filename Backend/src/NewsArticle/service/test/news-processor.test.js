import mongoose from "mongoose";
import dotenv from "dotenv";

import { processNewsBatch } from "../processor/news-processor.service.js";

dotenv.config();

const run = async () => {
  try {
    console.log("\n=================================");
    console.log("NEWS AI BATCH TEST START");
    console.log("=================================\n");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // -----------------------------
    // Process ONE batch
    // -----------------------------

    const result = await processNewsBatch();

    console.log("\nAI BATCH RESULT:");

    console.dir(result, {
      depth: null,
    });

    console.log("\n=================================");
    console.log("NEWS AI BATCH TEST COMPLETE");
    console.log("=================================");
  } catch (error) {
    console.error("\nAI TEST ERROR:", error.message);
  } finally {
    await mongoose.disconnect();

    console.log("\nMongoDB disconnected");
  }
};

run();
