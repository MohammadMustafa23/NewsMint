import NewsArticle from "../../models/NewsArticle.js";
import { summarizeNewsBatch } from "../ai/summarizer.service.js";

const BATCH_SIZE = 5;
const RETRY_DELAY = 10 * 60 * 1000;
const PROCESSING_TIMEOUT = 15 * 60 * 1000;
const MAX_AI_ATTEMPTS = 3;

export const processNewsBatch = async () => {
  const startedAt = Date.now();

  console.log("[AI_BATCH] Batch processing started");

  try {
    const now = new Date();
    const staleProcessingBefore = new Date(now.getTime() - PROCESSING_TIMEOUT);

    // ==================================================
    // RECOVER STALE PROCESSING ARTICLES
    // ==================================================

    const staleResult = await NewsArticle.updateMany(
      {
        "ai.processed": false,
        "ai.status": "processing",
        updatedAt: {
          $lte: staleProcessingBefore,
        },
      },
      {
        $set: {
          "ai.status": "failed",
          "ai.nextRetryAt": now,
        },
      },
    );

    if (staleResult.modifiedCount > 0) {
      console.warn(
        `[AI_BATCH] Stale processing articles recovered | count=${staleResult.modifiedCount}`,
      );
    }

    // ==================================================
    // FIND PENDING ARTICLES
    // ==================================================

    const articles = await NewsArticle.find({
      "ai.processed": false,
      $or: [
        {
          "ai.status": "pending",
          $or: [
            {
              "ai.attempts": {
                $lt: MAX_AI_ATTEMPTS,
              },
            },
            {
              "ai.attempts": {
                $exists: false,
              },
            },
          ],
        },
        {
          "ai.status": "failed",
          $and: [
            {
              $or: [
                {
                  "ai.attempts": {
                    $lt: MAX_AI_ATTEMPTS,
                  },
                },
                {
                  "ai.attempts": {
                    $exists: false,
                  },
                },
              ],
            },
            {
              $or: [
                {
                  "ai.nextRetryAt": null,
                },
                {
                  "ai.nextRetryAt": {
                    $lte: now,
                  },
                },
              ],
            },
          ],
        },
      ],
    })
      .sort({
        publishedAt: -1,
      })
      .limit(BATCH_SIZE);

    console.log(
      `[AI_BATCH] Articles selected | count=${articles.length} | batchSize=${BATCH_SIZE}`,
    );

    // ==================================================
    // NOTHING TO PROCESS
    // ==================================================

    if (!articles.length) {
      console.log(
        `[AI_BATCH] No pending news found | duration=${Date.now() - startedAt}ms`,
      );

      return {
        success: true,
        requested: 0,
        processed: 0,
        message: "No pending news found",
      };
    }

    const articleIds = articles.map((article) => article._id);

    console.log(
      `[AI_BATCH] Marking articles as processing | count=${articleIds.length}`,
    );

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

    // ==================================================
    // AI SUMMARIZATION
    // ==================================================

    let results;

    try {
      const aiStartedAt = Date.now();

      console.log(
        `[AI_BATCH] Sending batch to AI | articles=${articles.length}`,
      );

      results = await summarizeNewsBatch(articles);

      console.log(
        `[AI_BATCH] AI response received | results=${Array.isArray(results) ? results.length : 0} | duration=${Date.now() - aiStartedAt}ms`,
      );
    } catch (error) {
      console.error(
        `[AI_BATCH] AI batch failed | retryable=${Boolean(error.retryable)} | message="${error.message}"`,
        error,
      );

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

        console.warn(
          `[AI_BATCH] Retry scheduled | articles=${articleIds.length} | nextRetryAt=${nextRetryAt.toISOString()}`,
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

      console.error(
        `[AI_BATCH] Non-retryable AI error | articles=${articleIds.length}`,
      );

      throw error;
    }

    // ==================================================
    // VALIDATE AI RESULT
    // ==================================================

    if (!Array.isArray(results) || results.length !== articles.length) {
      console.error(
        `[AI_BATCH] Invalid AI result count | expected=${articles.length} | received=${results?.length || 0}`,
      );

      await NewsArticle.updateMany(
        {
          _id: {
            $in: articleIds,
          },
        },
        {
          $set: {
            "ai.status": "failed",
            "ai.nextRetryAt": new Date(Date.now() + RETRY_DELAY),
          },
        },
      );

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

    // ==================================================
    // SAVE AI RESULTS
    // ==================================================

    for (const article of articles) {
      const articleId = article._id.toString();

      const result = resultMap.get(articleId);

      if (!result) {
        console.error(`[AI_BATCH] Missing AI result | articleId=${articleId}`);

        await NewsArticle.updateOne(
          {
            _id: article._id,
          },
          {
            $set: {
              "ai.status": "failed",
              "ai.nextRetryAt": new Date(Date.now() + RETRY_DELAY),
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

    // ==================================================
    // BATCH COMPLETION
    // ==================================================

    console.log(
      `[AI_BATCH] Batch completed | requested=${articles.length} | received=${results.length} | processed=${processed} | missing=${articles.length - processed} | duration=${Date.now() - startedAt}ms`,
    );

    return {
      success: true,
      requested: articles.length,
      received: results.length,
      processed,
    };
  } catch (error) {
    console.error(
      `[AI_BATCH] Processing error | duration=${Date.now() - startedAt}ms | message="${error.message}"`,
      error,
    );

    throw error;
  }
};

export const processAllPendingNews = async () => {
  const startedAt = Date.now();

  let totalProcessed = 0;
  let batchNumber = 0;

  console.log("[AI_WORKER] Processing all pending news started");

  while (true) {
    console.log(`[AI_WORKER] Starting batch | batch=${batchNumber + 1}`);

    const result = await processNewsBatch();

    if (result.retryable && result.nextRetryAt) {
      console.warn(
        `[AI_WORKER] Processing paused for retry | batches=${batchNumber} | processed=${totalProcessed} | nextRetryAt=${result.nextRetryAt.toISOString()} | duration=${Date.now() - startedAt}ms`,
      );

      return {
        success: false,
        retryable: true,
        processed: totalProcessed,
        batches: batchNumber,
        nextRetryAt: result.nextRetryAt,
        message: result.message,
      };
    }

    if (!result.success) {
      console.error(
        `[AI_WORKER] Batch processing failed | batch=${batchNumber + 1} | message="${result.message || "AI batch processing failed"}"`,
      );

      throw new Error(result.message || "AI batch processing failed");
    }

    if (!result.processed) {
      console.log(
        `[AI_WORKER] No more pending articles | batches=${batchNumber} | processed=${totalProcessed}`,
      );

      break;
    }

    batchNumber++;

    totalProcessed += result.processed;

    console.log(
      `[AI_WORKER] Batch completed | batch=${batchNumber} | processed=${result.processed} | totalProcessed=${totalProcessed}`,
    );
  }

  console.log(
    `[AI_WORKER] Processing completed successfully | batches=${batchNumber} | processed=${totalProcessed} | duration=${Date.now() - startedAt}ms`,
  );

  return {
    success: true,
    processed: totalProcessed,
    batches: batchNumber,
  };
};
