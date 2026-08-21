import axios from "axios";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";
import { NEWSDATA_API_KEY } from "../../../config/env.js";

const NEWSDATA_URL = "https://newsdata.io/api/1/latest";

const MAX_ARTICLES_PER_CATEGORY = 5;

const createContentHash = (url) => {
  return crypto
    .createHash("sha256")
    .update(url.trim().toLowerCase())
    .digest("hex");
};

const cleanText = (text = "") => {
  if (!text) return "";

  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

/*
 * NewsData categories are different from
 * NewsMint categories.
 *
 * This mapping converts NewsData categories
 * into our NewsMint categories.
 */
const CATEGORY_MAP = {
  business: "Business",
  economy: "Business",

  technology: "Technology",

  sports: "Sports",

  entertainment: "Entertainment",

  world: "World",

  politics: "India",

  domestic: "India",

  top: "General",
};

/*
 * Convert NewsData category into one of our
 * NewsMint categories.
 */
const getCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return null;
  }

  const apiCategories = Array.isArray(item.category) ? item.category : [];

  /*
   * First try to map the API category.
   */
  for (const apiCategory of apiCategories) {
    const normalizedCategory = CATEGORY_MAP[apiCategory?.toLowerCase()];

    if (!normalizedCategory) {
      continue;
    }

    /*
     * Check if the mapped NewsMint category
     * is allowed for this source.
     */
    const matched = allowedCategories.find(
      (allowedCategory) =>
        allowedCategory.toLowerCase() === normalizedCategory.toLowerCase(),
    );

    if (matched) {
      return matched;
    }
  }

  /*
   * Fallback:
   * If API category cannot be mapped,
   * use the first category configured
   * for this source.
   */
  return allowedCategories[0];
};

export const fetchNewsData = async (source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!source) {
      throw new Error("NewsData source is required");
    }

    if (!NEWSDATA_API_KEY) {
      throw new Error("NewsData API key is not configured");
    }

    console.log(`\n📡 Fetching NewsData: ${source.name}`);

    // ==========================================
    // 2. BUILD API PARAMETERS
    // ==========================================

    const params = {
      apikey: NEWSDATA_API_KEY,

      country: "in",

      language: "en",

      /*
       * Ask NewsData to remove duplicates
       * from its own response.
       */
      removeduplicate: 1,
    };

    /*
     * NewsData supports category filtering.
     *
     * We only send categories that can be
     * understood by NewsData.
     */
    const newsDataCategories = [];

    for (const category of source.categories || []) {
      const normalized = category.toLowerCase();

      if (normalized === "business") {
        newsDataCategories.push("business");
      }

      if (normalized === "technology") {
        newsDataCategories.push("technology");
      }

      if (normalized === "sports") {
        newsDataCategories.push("sports");
      }

      if (normalized === "entertainment") {
        newsDataCategories.push("entertainment");
      }

      if (normalized === "world") {
        newsDataCategories.push("world");
      }

      if (normalized === "india") {
        newsDataCategories.push("politics");
        newsDataCategories.push("domestic");
      }
    }

    /*
     * NewsData allows multiple categories.
     */
    if (newsDataCategories.length) {
      params.category = [...new Set(newsDataCategories)].join(",");
    }

    // ==========================================
    // 3. API REQUEST
    // ==========================================

    const response = await axios.get(NEWSDATA_URL, {
      params,
      timeout: 15000,
    });

    // ==========================================
    // 4. API RESPONSE VALIDATION
    // ==========================================

    if (response.data?.status !== "success") {
      throw new Error(
        response.data?.message ||
          "NewsData API returned an unsuccessful response",
      );
    }

    const articles = Array.isArray(response.data.results)
      ? response.data.results
      : [];

    console.log(`📰 ${source.name}: ${articles.length} articles found`);

    // ==========================================
    // 5. COUNTERS
    // ==========================================

    let saved = 0;
    let skipped = 0;

    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    // ==========================================
    // 6. PROCESS ARTICLES
    // ==========================================

    for (const item of articles) {
      try {
        // ------------------------------------------
        // Basic validation
        // ------------------------------------------

        if (!item.title || !item.link) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || item.content || "");

        const url = item.link.trim();

        if (!title || !url) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Category
        // ------------------------------------------

        const category = getCategory(item, source);

        if (!category) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Maximum articles per category
        // ------------------------------------------

        if (categoryCounts[category] >= MAX_ARTICLES_PER_CATEGORY) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Duplicate hash
        // ------------------------------------------

        const contentHash = createContentHash(url);

        const exists = await NewsArticle.exists({
          contentHash,
        });

        if (exists) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Published date
        // ------------------------------------------

        let publishedAt = null;

        if (item.pubDate) {
          const date = new Date(item.pubDate);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        // ------------------------------------------
        // Author
        // ------------------------------------------

        const author = Array.isArray(item.creator)
          ? item.creator[0] || ""
          : item.creator || "";

        // ------------------------------------------
        // Tags
        // ------------------------------------------

        const tags = Array.isArray(item.keywords) ? item.keywords : [];

        // ------------------------------------------
        // Save article
        // ------------------------------------------

        await NewsArticle.create({
          source: source._id,

          title,

          description,

          url,

          image: item.image_url || "",

          author,

          publishedAt,

          category,

          tags,

          fetchMethod: "api",

          contentHash,

          /*
           * This is the time NewsMint fetched
           * the article.
           */
          newsDate: new Date(),

          /*
           * AI processing starts as false
           * automatically from schema default.
           */
          ai: {
            processed: false,
          },
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        /*
         * One bad article should NOT stop
         * the complete source.
         */

        console.error(`❌ Article Error: ${item.title}`, articleError.message);
      }
    }

    // ==========================================
    // 7. RESULT
    // ==========================================

    console.log(`📊 ${source.name} category counts:`, categoryCounts);

    console.log(`✅ ${source.name} | Saved: ${saved} | Skipped: ${skipped}`);

    return {
      success: true,

      source: source.name,

      total: articles.length,

      saved,

      skipped,

      categoryCounts,
    };
  } catch (error) {
    // ==========================================
    // API ERROR
    // ==========================================

    console.error(
      `❌ NewsData Error - ${source?.name || "NewsData.io"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "NewsData.io",

      message: error.response?.data?.message || error.message,
    };
  }
};
