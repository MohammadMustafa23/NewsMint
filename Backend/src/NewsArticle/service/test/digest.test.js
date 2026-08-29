import mongoose from "mongoose";
import dotenv from "dotenv";

import { generateUserDigest } from "../NewsGenerator/digest.service.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Actual userId copied from MongoDB
    const userId = "6a8590fec3fa96754f93c817";

    const result = await generateUserDigest(userId);
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
  }
};

run();
