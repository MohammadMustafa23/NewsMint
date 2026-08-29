import NewsArticle from "../../NewsArticle/models/NewsArticle.js";

export const cleanupOldNews = async () => {
  try {
    const cutoffDate = new Date();

    // Keep last 2 days
    cutoffDate.setDate(cutoffDate.getDate() - 2);

    const result = await NewsArticle.deleteMany({
      publishedAt: {
        $lt: cutoffDate,
      },
    });

    return result.deletedCount;
  } catch (error) {
    console.error("❌ News Cleanup Failed:", error.message);
    throw error;
  }
};
