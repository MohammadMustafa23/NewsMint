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
  const jobStarted = Date.now();

  console.log(`[NEWS_FETCH] Job started | ${startedAt.toISOString()}`);

  try {
    // --------------------------------------------------
    // FETCH NEWS
    // --------------------------------------------------

    console.log("[NEWS_FETCH] Fetching news from sources...");

    const newsResult = await fetchAllNews();

    console.log(
      `[NEWS_FETCH] Fetch completed | ` +
        `categories=${newsResult.categories || 0} | ` +
        `candidates=${newsResult.totalCandidates || 0} | ` +
        `selected=${newsResult.totalSelected || 0} | ` +
        `saved=${newsResult.totalSaved || 0}`,
    );

    // --------------------------------------------------
    // AI PROCESSING
    // --------------------------------------------------

    if (newsResult.totalSaved > 0) {
      console.log(
        `[NEWS_FETCH] ${newsResult.totalSaved} new articles saved | Starting AI worker...`,
      );

      try {
        const aiStartedAt = Date.now();

        const result = await startAINewsWorker();

        console.log(
          `[AI_WORKER] Completed successfully | duration=${Date.now() - aiStartedAt}ms`,
        );

        if (result) {
          console.log("[AI_WORKER] Result:", result);
        }
      } catch (error) {
        console.error(`[AI_WORKER] Failed | message="${error.message}"`, error);
      }
    } else {
      console.log("[NEWS_FETCH] No new articles saved | AI worker skipped");
    }

    // --------------------------------------------------
    // CLEAN OLD NEWS
    // --------------------------------------------------

    console.log("[NEWS_CLEANUP] Starting old news cleanup...");

    const cleanupStartedAt = Date.now();

    const cleanupResult = await cleanupOldNews();

    console.log(
      `[NEWS_CLEANUP] Completed | duration=${Date.now() - cleanupStartedAt}ms`,
    );

    if (cleanupResult) {
      console.log("[NEWS_CLEANUP] Result:", cleanupResult);
    }

    // --------------------------------------------------
    // COMPLETION
    // --------------------------------------------------

    const completedAt = new Date();
    const duration = Date.now() - jobStarted;

    console.log(
      `[NEWS_FETCH] Job completed successfully | duration=${duration}ms | completedAt=${completedAt.toISOString()}`,
    );

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
    const duration = Date.now() - jobStarted;

    console.error(
      `[NEWS_FETCH] Job failed | duration=${duration}ms | message="${error.message}"`,
      error,
    );

    throw error;
  }
};

// ======================================================
// AI RETRY CHECK
// ======================================================

export const processAIRetryScheduler = async () => {
  const startedAt = Date.now();

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

    console.log(`[AI_RETRY] Retry ready | articleId=${retryArticle._id}`);

    const result = await startAINewsWorker();

    console.log(
      `[AI_RETRY] Retry worker completed | duration=${Date.now() - startedAt}ms`,
    );

    return result;
  } catch (error) {
    console.error(
      `[AI_RETRY] Scheduler failed | duration=${Date.now() - startedAt}ms | message="${error.message}"`,
      error,
    );

    throw error;
  }
};

// ======================================================
// START SCHEDULERS
// ======================================================

const startNewsScheduler = () => {
  console.log("[SCHEDULER] Starting NewsMint schedulers...");

  // ====================================================
  // DAILY NEWS FETCH
  // ====================================================

  // 6:30 PM
  cron.schedule("0 6,18 * * *", async () => {
    const triggeredAt = new Date();

    console.log(`[CRON][NEWS_FETCH] Triggered | ${triggeredAt.toISOString()}`);

    try {
      await processNewsFetchScheduler();

      console.log("[CRON][NEWS_FETCH] Execution completed");
    } catch (error) {
      console.error(
        `[CRON][NEWS_FETCH] Execution failed | message="${error.message}"`,
        error,
      );
    }
  });

  // ====================================================
  // AI RETRY CHECK
  //
  // Runs every minute.
  //
  // It only checks whether a failed batch
  // has reached nextRetryAt.
  // ====================================================

  cron.schedule("* * * * *", async () => {
    try {
      const result = await processAIRetryScheduler();

      if (result?.started) {
        console.log("[CRON][AI_RETRY] Retry worker started");
      }
    } catch (error) {
      console.error(`[CRON][AI_RETRY] Execution failed | message="${error.message}"`,error,
      );
    }
  });

  console.log("[SCHEDULER] NewsMint schedulers started successfully");
  console.log("[SCHEDULER] News fetch: Daily at 18:30");
  console.log("[SCHEDULER] AI retry check: Every minute");
};

export default startNewsScheduler;
