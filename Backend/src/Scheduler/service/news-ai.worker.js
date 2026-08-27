import { processAllPendingNews } from "../../NewsArticle/service/processor/news-processor.service.js";

export const startAINewsWorker = async () => {
  try {
    console.log("🤖 AI News Worker Started");

    const result = await processAllPendingNews();

    if (!result.success) {
      console.log(
        `AI News Worker Paused | Processed: ${result.processed} | Batches: ${result.batches}`,
      );

      return result;
    }

    console.log(
      `✅ AI News Worker Finished | Processed: ${result.processed} | Batches: ${result.batches}`,
    );

    return result;
  } catch (error) {
    console.error("❌ AI News Worker Failed:", error.message);

    return {
      success: false,
      processed: 0,
      batches: 0,
      message: error.message,
    };
  }
};
