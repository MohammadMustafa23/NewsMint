import mongoose from "mongoose";
import Source from "../../Feature/NewsSource/models/source.models.js";
import { fetchRSSSource } from "../service/news/rss.service.js";
import dotenv from 'dotenv'
dotenv.config()

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const sources = await Source.find({
      fetchMethod: "rss",
      isActive: true,
      rssUrl: { $ne: "" },
    });

    if (!sources.length) {
      throw new Error("No active RSS sources found");
    }

    console.log(`Found ${sources.length} RSS sources`);

    const results = [];

    for (const source of sources) {
      try {
        console.log("\n=================================");
        console.log(`Fetching: ${source.name}`);
        console.log("=================================");

        const result = await fetchRSSSource(source);

        results.push(result);

        console.log("RSS RESULT:");
        console.log(result);
      } catch (error) {
        console.error(
          `Failed: ${source.name}`,
          error.message,
        );

        results.push({
          success: false,
          source: source.name,
          message: error.message,
        });
      }
    }

    console.log("\n=================================");
    console.log("ALL RSS FETCH RESULTS");
    console.log("=================================");

    console.table(
      results.map((result) => ({
        source: result.source,
        success: result.success,
        total: result.total || 0,
        saved: result.saved || 0,
        skipped: result.skipped || 0,
      })),
    );
  } catch (error) {
    console.error("RSS TEST ERROR:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

run();