import cron from "node-cron";

import Source from "../Feature/NewsSource/models/source.models.js";

import { fetchRSSSource } from "../NewsArticle/service/news/rss.service.js";
import { fetchGNews } from "../NewsArticle/service/news/gnews.service.js";
import { fetchNewsData } from "../NewsArticle/service/news/newsdata.service.js";
import { fetchGuardianNews } from "../NewsArticle/service/news/guardian.service.js";

import { processNewsBatch } from "../NewsArticle/service/processor/news-processor.service.js";

export const processNewsScheduler = async () => {
  const startedAt = new Date();

  console.log("\n========================================");
  console.log("📰 NewsMint Scheduler 2 Started");
  console.log(`⏰ ${startedAt.toISOString()}`);
  console.log("========================================\n");

  try {
    const sources = await Source.find({
      isActive: true,
    }).sort({ sortOrder: 1 }).lean();

    if (!sources.length) {
      console.log("⚠️ No active sources found");
      return {
        success: true,
        sources: 0,
        saved: 0,
        skipped: 0,
        processed: 0,
      };
    }

    console.log(`📡 Active sources: ${sources.length}`);

    let successfulSources = 0;
    let failedSources = 0;
    let totalSaved = 0;
    let totalSkipped = 0;

    for (const source of sources) {
      try {
        console.log(
          `\n🔄 Fetching: ${source.name} | ${source.fetchMethod}${source.provider ? ` | ${source.provider}` : "" }`,
        );

        let result = null;

        if (source.fetchMethod === "rss") {
          result = await fetchRSSSource(source);
        } else if (source.fetchMethod === "api") {
          const provider = source.provider?.toLowerCase();
          if (provider === "gnews") {
            result = await fetchGNews(source);
          } else if (provider === "newsdata") {
            result = await fetchNewsData(source);
          } else if (provider === "guardian") {
            result = await fetchGuardianNews(source);
          } else {
            console.log(`⏭️ Unknown API provider: ${source.provider}`);
            continue;
          }
        } else {
          console.log(`⏭️ Unknown fetch method: ${source.fetchMethod}`);
          continue;
        }

        if (result?.success) {
          successfulSources++;

          totalSaved += result.saved || 0;
          totalSkipped += result.skipped || 0;

          console.log( `✅ ${source.name} | Saved: ${ result.saved || 0 } | Skipped: ${result.skipped || 0}`);
        } else {
          failedSources++;
          console.log(
            `❌ ${source.name} failed: ${result?.message || "Unknown error"}`,
          );
        }
      } catch (error) {
        failedSources++;
        console.error(`❌ Source failed: ${source.name}`, error.message);
      }
    }

    console.log("\n----------------------------------------");
    console.log("📊 FETCH SUMMARY");
    console.log("----------------------------------------");
    console.log(`Sources:    ${sources.length}`);
    console.log(`Successful: ${successfulSources}`);
    console.log(`Failed:     ${failedSources}`);
    console.log(`Saved:      ${totalSaved}`);
    console.log(`Skipped:    ${totalSkipped}`);

    console.log("\n🤖 Starting AI processing...");

    let totalProcessed = 0;
    let batchNumber = 0;

    while (true) {
      const result = await processNewsBatch();

      if (!result.success) {
        throw new Error(result.message || "AI processing failed");
      }

      if (!result.processed) {
        break;
      }

      batchNumber++;
      totalProcessed += result.processed;

      console.log(
        `🤖 Batch ${batchNumber}: ${result.processed} articles processed`,
      );
    }

    const completedAt = new Date();

    console.log("\n========================================");
    console.log("✅ NewsMint Scheduler 2 Completed");
    console.log("========================================");
    console.log(`📰 New articles: ${totalSaved}`);
    console.log(`⏭️ Skipped: ${totalSkipped}`);
    console.log(`🤖 AI processed: ${totalProcessed}`);
    console.log(`⏱️ Started: ${startedAt.toISOString()}`);
    console.log(`⏱️ Finished: ${completedAt.toISOString()}`);
    console.log("========================================\n");

    return {
      success: true,
      sources: {
        total: sources.length,
        successful: successfulSources,
        failed: failedSources,
      },
      news: {
        saved: totalSaved,
        skipped: totalSkipped,
      },
      ai: {
        processed: totalProcessed,
        batches: batchNumber,
      },
      startedAt,
      completedAt,
    };
  } catch (error) {
    console.error("❌ NewsMint Scheduler 2 Error:", error.message);
    throw error;
  }
};

const startNewsScheduler = () => {
  cron.schedule("0 6,18 * * *", async () => {
    try {
      await processNewsScheduler();
    } catch (error) {
      console.error("❌ Scheduled News Job Failed:", error.message);
    }
  });

  console.log("📅 NewsMint Scheduler 2 started");
  console.log("⏰ Runs daily at 6:00 AM and 6:00 PM");
};

export default startNewsScheduler;
