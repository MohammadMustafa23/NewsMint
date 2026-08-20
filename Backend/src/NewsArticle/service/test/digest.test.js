import mongoose from "mongoose";
import dotenv from "dotenv";

import { generateUserDigest } from "../NewsGenerator/digest.service.js";

dotenv.config();

const run = async () => {
  try {
    console.log("\n=================================");
    console.log("USER DIGEST TEST START");
    console.log("=================================\n");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Actual userId copied from MongoDB
    const userId = "6a8590fec3fa96754f93c817";

    const result = await generateUserDigest(userId);

    console.log("\nDIGEST RESULT:\n");

    console.log(result.digest);

    console.log("\nDETAILS:");

    console.dir(
      {
        success: result.success,
        count: result.count,
        categories: result.categories,
        language: result.language,
      },
      { depth: null },
    );
  } catch (error) {
    console.error("DIGEST TEST ERROR:", error.message);
  } finally {
    await mongoose.disconnect();

    console.log("\nMongoDB disconnected");
  }
};

run();
