import NewsArticle from "../../models/NewsArticle.js";
import { summarizeNewsBatch } from "../ai/summarizer.service.js";

const BATCH_SIZE = 10;

export const processNewsBatch = async () => {
  try {
    const articles = await NewsArticle.find({
      "ai.processed": false,
    })
      .sort({
        publishedAt: -1,
      })
      .limit(BATCH_SIZE);
      console.log(articles[0]);
      
    if (!articles.length) {
      return {
        success: true,
        requested: 0,
        processed: 0,
        message: "No unprocessed news found",
      };
    }

    console.log(`Found ${articles.length} unprocessed articles`);

    // -----------------------------
    // Send 10 articles to LLM
    // -----------------------------

    const results = await summarizeNewsBatch(articles);

    // -----------------------------
    // Validate result count
    // -----------------------------

    if (results.length !== articles.length) {
      throw new Error(
        `LLM returned ${results.length} results, expected ${articles.length}`,
      );
    }

    // -----------------------------
    // Create result map
    // -----------------------------

    const resultMap = new Map();

    for (const result of results) {
      resultMap.set(result.articleId, result);
    }

    let processed = 0;

    // -----------------------------
    // Update MongoDB
    // -----------------------------

    for (const article of articles) {
      const articleId = article._id.toString();

      const result = resultMap.get(articleId);

      if (!result) {
        console.error(`Missing AI result for article: ${articleId}`);
        continue;
      }

      article.ai.processed = true;
      article.ai.summary.english = result.summary?.english || "";
      article.ai.summary.hindi = result.summary?.hindi || "";
      article.ai.keyPoints.english = result.keyPoints?.english || [];
      article.ai.keyPoints.hindi = result.keyPoints?.hindi || [];

      await article.save();

      processed++;
    }

    return {
      success: true,
      requested: articles.length,
      received: results.length,
      processed,
    };
  } catch (error) {
    console.error("News Batch Processing Error:", error.message);

    throw error;
  }
};
