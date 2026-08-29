import { processAllPendingNews } from "../../NewsArticle/service/processor/news-processor.service.js";

export const startAINewsWorker = async () => {
  try {
   
    const result = await processAllPendingNews();

    if (!result.success) {
      return result;
    }

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
