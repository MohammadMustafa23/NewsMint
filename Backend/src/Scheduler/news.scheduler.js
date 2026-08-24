import cron from "node-cron";

import { fetchAllNews } from "../NewsArticle/ActualNewsFetchwork/news-fetch.service.js";
import { startAINewsWorker } from "./service/news-ai.worker.js";
import { cleanupOldNews } from "./cleanUp/cleanupNews.service.js";

export const processNewsScheduler = async () => {
  const startedAt = new Date();

  console.log("\n========================================");
  console.log("📰 NewsMint Daily News Scheduler Started");
  console.log(`⏰ ${startedAt.toISOString()}`);
  console.log("========================================\n");

  try {
    console.log("📡 Starting News Fetch...");

    const newsResult = await fetchAllNews();

    console.log("\n----------------------------------------");
    console.log("📊 NEWS FETCH SUMMARY");
    console.log("----------------------------------------");

    console.log(`📂 Categories: ${newsResult.categories || 0}`);
    console.log(`📰 Candidates: ${newsResult.totalCandidates || 0}`);
    console.log(`🎯 Selected: ${newsResult.totalSelected || 0}`);
    console.log(`💾 Saved: ${newsResult.totalSaved || 0}`);
    console.log("\n🤖 Starting AI News Worker...");

    try {
      const result = await startAINewsWorker();

      if (result.success) {
        console.log(
          `✅ AI Worker Finished | ` +
            `Processed: ${result.processed} | ` +
            `Batches: ${result.batches}`,
        );
      } else {
        console.error(
          `⚠️ AI Worker Finished With Error: ${
            result.message || "Unknown error"
          }`,
        );
      }
    } catch (error) {
      console.error("❌ AI Worker Error:", error.message);
    }

    // ==========================================
    // CLEAN OLD NEWS
    // ==========================================

    console.log("\n🗑️ Starting Old News Cleanup...");
    await cleanupOldNews();
    console.log("✅ Old News Cleanup Completed");

    // Log completion details
    const completedAt = new Date();

    console.log("\n========================================");
    console.log("✅ NewsMint Daily News Scheduler Completed");
    console.log("========================================");
    console.log(`📰 New articles saved: ${newsResult.totalSaved || 0}`);
    console.log(`⏱️ Started: ${startedAt.toISOString()}`);
    console.log(`⏱️ Finished: ${completedAt.toISOString()}`);
    console.log("🤖 AI Worker Completed");
    console.log("🗑️ Old News Cleanup Completed");
    console.log("========================================\n");

    return {
      success: true,
      news: {
        categories: newsResult.categories || 0,
        candidates: newsResult.totalCandidates || 0,
        selected: newsResult.totalSelected || 0,
        saved: newsResult.totalSaved || 0,
      },
      startedAt,
      completedAt,
    };
  } catch (error) {
    console.error("❌ NewsMint Scheduler Error:", error.message);

    throw error;
  }
};

const startNewsScheduler = () => {
  cron.schedule("03 17 24 8 *", async () => {
    try {
      await processNewsScheduler();
    } catch (error) {
      console.error("❌ Scheduled News Job Failed:", error.message);
    }
  });

  console.log("📅 NewsMint Scheduler started");
  console.log("⏰ Runs daily at 6:00 AM and 6:00 PM");
};

export default startNewsScheduler;
