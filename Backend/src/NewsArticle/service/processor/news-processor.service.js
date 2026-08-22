import NewsArticle from "../../models/NewsArticle.js";
import { summarizeNewsBatch } from "../ai/summarizer.service.js";

const BATCH_SIZE = 5;
const RETRY_DELAY = 10 * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processNewsBatch = async () => {
  try {
    const now = new Date();

    const articles = await NewsArticle.find({
      "ai.processed": false,
      $or: [
        {
          "ai.status": "pending",
        },
        {
          "ai.status": "failed",
          "ai.nextRetryAt": {
            $lte: now,
          },
        },
      ],
    })
      .sort({
        publishedAt: -1,
      })
      .limit(BATCH_SIZE);

    if (!articles.length) {
      return {
        success: true,
        requested: 0,
        processed: 0,
        message: "No pending news found",
      };
    }

    console.log(`🤖 Found ${articles.length} pending articles`);

    const articleIds = articles.map((article) => article._id);

    await NewsArticle.updateMany(
      {
        _id: {
          $in: articleIds,
        },
      },
      {
        $set: {
          "ai.status": "processing",
        },
        $inc: {
          "ai.attempts": 1,
        },
      },
    );

    let results;

    try {
      results = await summarizeNewsBatch(articles);
    } catch (error) {
      console.error("❌ AI batch failed:", error.message);

      if (error.retryable) {
        const nextRetryAt = new Date(Date.now() + RETRY_DELAY);

        await NewsArticle.updateMany(
          {
            _id: {
              $in: articleIds,
            },
          },
          {
            $set: {
              "ai.status": "failed",
              "ai.nextRetryAt": nextRetryAt,
            },
          },
        );

        console.log(
          `⏳ AI limit/error detected. Retry after 10 minutes: ${nextRetryAt.toISOString()}`,
        );

        return {
          success: false,
          retryable: true,
          requested: articles.length,
          processed: 0,
          nextRetryAt,
          message: "AI temporarily unavailable. Batch scheduled for retry.",
        };
      }

      await NewsArticle.updateMany(
        {
          _id: {
            $in: articleIds,
          },
        },
        {
          $set: {
            "ai.status": "failed",
          },
        },
      );

      throw error;
    }

    if (!Array.isArray(results) || results.length !== articles.length) {
      throw new Error(
        `Invalid AI result count. Expected ${articles.length}, received ${
          results?.length || 0
        }`,
      );
    }

    const resultMap = new Map();

    for (const result of results) {
      resultMap.set(result.articleId, result);
    }

    let processed = 0;

    for (const article of articles) {
      const articleId = article._id.toString();

      const result = resultMap.get(articleId);

      if (!result) {
        console.error(`⚠️ Missing AI result: ${articleId}`);

        await NewsArticle.updateOne(
          {
            _id: article._id,
          },
          {
            $set: {
              "ai.status": "failed",
            },
          },
        );

        continue;
      }

      article.ai.processed = true;
      article.ai.status = "completed";
      article.ai.nextRetryAt = null;

      article.ai.summary.english = result.summary.english;

      article.ai.summary.hindi = result.summary.hindi;

      article.ai.keyPoints.english = result.keyPoints.english;

      article.ai.keyPoints.hindi = result.keyPoints.hindi;

      await article.save();

      processed++;
    }

    console.log(`✅ AI Batch Completed: ${processed}/${articles.length}`);

    return {
      success: true,
      requested: articles.length,
      received: results.length,
      processed,
    };
  } catch (error) {
    console.error("❌ News Batch Processing Error:", error.message);

    throw error;
  }
};

export const processAllPendingNews = async () => {
  console.log("\n🤖 AI News Worker Started");

  let totalProcessed = 0;
  let batchNumber = 0;

  while (true) {
    const result = await processNewsBatch();

    if (result.retryable && result.nextRetryAt) {
      console.log("⏳ Waiting 10 minutes before retrying...");

      await sleep(RETRY_DELAY);

      continue;
    }

    if (!result.success) {
      throw new Error(result.message || "AI batch processing failed");
    }

    if (!result.processed) {
      break;
    }

    batchNumber++;

    totalProcessed += result.processed;

    console.log(
      `🤖 Batch ${batchNumber} | Processed: ${result.processed} | Total: ${totalProcessed}`,
    );
  }

  console.log(`✅ AI News Worker Completed | Total: ${totalProcessed}`);

  return {
    success: true,
    processed: totalProcessed,
    batches: batchNumber,
  };
};
