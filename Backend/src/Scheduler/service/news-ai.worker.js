import { processAllPendingNews } from "../../NewsArticle/service/processor/news-processor.service.js";

export const startAINewsWorker = async () => {
  const startedAt = Date.now();

  console.log("[AI_WORKER] Started | Processing pending news...");

  try {
    const result = await processAllPendingNews();

    if (!result.success) {
      console.warn(
        `[AI_WORKER] Completed with failure | processed=${result.processed || 0} | batches=${result.batches || 0} | duration=${Date.now() - startedAt}ms | message="${result.message || "Unknown error"}"`,
      );

      return result;
    }

    console.log(
      `[AI_WORKER] Completed successfully | processed=${result.processed || 0} | batches=${result.batches || 0} | duration=${Date.now() - startedAt}ms`,
    );

    return result;
  } catch (error) {
    console.error(
      `[AI_WORKER] Failed | duration=${Date.now() - startedAt}ms | message="${error.message}"`,
      error,
    );

    return {
      success: false,
      processed: 0,
      batches: 0,
      message: error.message,
    };
  }
};
