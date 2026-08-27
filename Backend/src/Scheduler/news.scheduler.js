import cron from "node-cron";

import { fetchAllNews } from "../NewsArticle/ActualNewsFetchwork/news-fetch.service.js";
import { startAINewsWorker } from "./service/news-ai.worker.js";
import { cleanupOldNews } from "./cleanUp/cleanupNews.service.js";
import NewsArticle from "../NewsArticle/models/NewsArticle.js";

// ======================================================
// DAILY NEWS FETCH
// ======================================================

export const processNewsFetchScheduler = async () => {
  const startedAt = new Date();

  console.log("\n========================================");
  console.log("📰 NewsMint Daily News Fetch Started");
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

    // ==================================================
    // START AI ONLY IF NEW NEWS WAS SAVED
    // ==================================================

    if (newsResult.totalSaved > 0) {
      console.log("\n🤖 New news found. Starting AI Worker...");

      try {
        const result = await startAINewsWorker();

        if (result.success) {
          console.log(
            `✅ AI Worker Finished | ` +
              `Processed: ${result.processed} | ` +
              `Batches: ${result.batches}`,
          );
        } else if (result.retryable) {
          console.log(
            `⏳ AI Worker Paused | ` +
              `Processed: ${result.processed} | ` +
              `Batches: ${result.batches} | ` +
              `Next Retry: ${result.nextRetryAt?.toISOString()}`,
          );
        } else {
          console.error(
            `❌ AI Worker Failed: ${result.message || "Unknown error"}`,
          );
        }
      } catch (error) {
        console.error("❌ AI Worker Error:", error.message);
      }
    } else {
      console.log("\nℹ️ No new news saved. AI Worker will not start.");
    }

    // ==================================================
    // CLEAN OLD NEWS
    // ==================================================

    console.log("\n🗑️ Starting Old News Cleanup...");

    await cleanupOldNews();

    console.log("✅ Old News Cleanup Completed");

    // ==================================================
    // COMPLETION
    // ==================================================

    const completedAt = new Date();

    console.log("\n========================================");
    console.log("✅ NewsMint Daily News Scheduler Completed");
    console.log("========================================");

    console.log(`📰 New articles saved: ${newsResult.totalSaved || 0}`);

    console.log(`⏱️ Started: ${startedAt.toISOString()}`);

    console.log(`⏱️ Finished: ${completedAt.toISOString()}`);

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
    console.error("❌ Daily News Fetch Error:", error.message);

    throw error;
  }
};

// ======================================================
// AI RETRY CHECK
// ======================================================

export const processAIRetryScheduler = async () => {
  try {
    const now = new Date();

    // --------------------------------------------------
    // Check whether a retry is actually ready
    // --------------------------------------------------

    const retryArticle = await NewsArticle.findOne({
      "ai.processed": false,

      "ai.status": "failed",

      "ai.nextRetryAt": {
        $lte: now,
      },
    })
      .select("_id")
      .lean();

    // --------------------------------------------------
    // Nothing ready
    // --------------------------------------------------

    if (!retryArticle) {
      return {
        success: true,
        started: false,
        message: "No AI retry is ready",
      };
    }

    // --------------------------------------------------
    // Retry is ready
    // --------------------------------------------------

    console.log("\n========================================");

    console.log("🔄 AI Retry Scheduler Started");

    console.log(`⏰ ${now.toISOString()}`);

    console.log("========================================\n");

    const result = await startAINewsWorker();

    if (result.success) {
      console.log(
        `✅ AI Retry Completed | ` +
          `Processed: ${result.processed} | ` +
          `Batches: ${result.batches}`,
      );
    } else if (result.retryable) {
      console.log(
        `⏳ AI Retry Failed Again | ` +
          `Next Retry: ${result.nextRetryAt?.toISOString()}`,
      );
    }

    return result;
  } catch (error) {
    console.error("❌ AI Retry Scheduler Error:", error.message);

    throw error;
  }
};

// ======================================================
// START SCHEDULERS
// ======================================================

const startNewsScheduler = () => {
  // ====================================================
  // DAILY NEWS FETCH
  // ====================================================

  cron.schedule("0 6,18 * * *", async () => {
    try {
      await processNewsFetchScheduler();
    } catch (error) {
      console.error("❌ Daily News Job Failed:", error.message);
    }
  });

  // ====================================================
  // AI RETRY CHECK
  //
  // This is NOT the AI worker.
  //
  // It only checks whether a failed batch
  // has reached nextRetryAt.
  // ====================================================

  cron.schedule("* * * * *", async () => {
    try {
      await processAIRetryScheduler();
    } catch (error) {
      console.error("❌ AI Retry Job Failed:", error.message);
    }
  });

  // ====================================================
  // LOG
  // ====================================================

  console.log("📅 NewsMint Scheduler started");

  console.log("📰 News Fetch: 6:00 AM & 6:00 PM");

  console.log("🤖 AI Worker: Starts only when new news arrives");

  console.log("🔄 AI Retry: Checks every minute for retryAt");
};

export default startNewsScheduler;
