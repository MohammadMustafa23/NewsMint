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
  try {
    const newsResult = await fetchAllNews();
    // ==================================================
    // START AI ONLY IF NEW NEWS WAS SAVED
    // ==================================================

    if (newsResult.totalSaved > 0) {
      try {
        const result = await startAINewsWorker();
      } catch (error) {
        console.error("❌ AI Worker Error:", error.message);
      }
    } else {
    }

    // ==================================================
    // CLEAN OLD NEWS
    // ==================================================

    await cleanupOldNews();


    // ==================================================
    // COMPLETION
    // ==================================================

    const completedAt = new Date();
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

    const result = await startAINewsWorker();
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

};

export default startNewsScheduler;
