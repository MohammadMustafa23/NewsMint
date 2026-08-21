import axios from "axios";
import crypto from "crypto";

import { GNEWS_API_KEY } from "../../../config/env.js";
import NewsArticle from "../../models/NewsArticle.js";

const GNEWS_URL = "https://gnews.io/api/v4/top-headlines";

const MAX_ARTICLES_PER_CATEGORY = 5;
const MAX_API_ARTICLES = 20;

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
 * NewsMint category detection.
 *
 * GNews top-headlines does not always provide
 * a category that matches our NewsMint categories,
 * so we detect it from title + description.
 */
const CATEGORY_KEYWORDS = {
  India: [
    "india",
    "indian",
    "delhi",
    "mumbai",
    "jaipur",
    "rajasthan",
    "uttar pradesh",
    "bihar",
    "maharashtra",
    "government",
    "supreme court",
    "parliament",
    "lok sabha",
    "rajya sabha",
  ],

  World: [
    "world",
    "usa",
    "america",
    "united states",
    "uk",
    "britain",
    "china",
    "russia",
    "ukraine",
    "israel",
    "iran",
    "pakistan",
    "europe",
    "international",
  ],

  Business: [
    "business",
    "economy",
    "economic",
    "market",
    "stock",
    "stocks",
    "share",
    "shares",
    "company",
    "companies",
    "startup",
    "investment",
    "investor",
    "bank",
    "banking",
    "finance",
    "financial",
    "rupee",
    "dollar",
    "gdp",
  ],

  Technology: [
    "technology",
    "tech",
    "artificial intelligence",
    "ai",
    "software",
    "google",
    "microsoft",
    "apple",
    "openai",
    "meta",
    "amazon",
    "iphone",
    "android",
    "cyber",
    "robot",
    "robotics",
  ],

  Sports: [
    "sport",
    "sports",
    "cricket",
    "football",
    "soccer",
    "tennis",
    "hockey",
    "basketball",
    "ipl",
    "match",
    "player",
    "team",
    "world cup",
    "olympics",
  ],

  Entertainment: [
    "entertainment",
    "bollywood",
    "hollywood",
    "movie",
    "movies",
    "film",
    "actor",
    "actress",
    "celebrity",
    "music",
    "singer",
    "concert",
    "web series",
    "ott",
    "television",
  ],
};

const getCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return null;
  }

  const text = `
    ${item.title || ""}
    ${item.description || ""}
  `.toLowerCase();

  /*
   * Only check categories configured
   * for this particular source.
   */
  for (const category of allowedCategories) {
    const keywords = CATEGORY_KEYWORDS[category] || [];

    const matched = keywords.some((keyword) =>
      text.includes(keyword.toLowerCase()),
    );

    if (matched) {
      return category;
    }
  }

  /*
   * Fallback to first configured category.
   */
  return allowedCategories[0];
};

export const fetchGNews = async (source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!source) {
      throw new Error("GNews source is required");
    }

    if (!GNEWS_API_KEY) {
      throw new Error("GNews API key is not configured");
    }

    console.log(`\n📡 Fetching GNews: ${source.name}`);

    // ==========================================
    // 2. API PARAMETERS
    // ==========================================

    const params = {
      apikey: GNEWS_API_KEY,

      country: "in",

      lang: "en",

      max: MAX_API_ARTICLES,
    };

    // ==========================================
    // 3. API REQUEST
    // ==========================================

    const response = await axios.get(GNEWS_URL, {
      params,
      timeout: 15000,
    });

    if (response.data?.errors && response.data.errors.length) {
      throw new Error(response.data.errors.join(", "));
    }

    const articles = Array.isArray(response.data?.articles)
      ? response.data.articles
      : [];

    console.log(`📰 ${source.name}: ${articles.length} articles found`);

    // ==========================================
    // 4. COUNTERS
    // ==========================================

    let saved = 0;
    let skipped = 0;

    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    // ==========================================
    // 5. PROCESS ARTICLES
    // ==========================================

    for (const item of articles) {
      try {
        // ------------------------------------------
        // Basic validation
        // ------------------------------------------

        if (!item.title || !item.url) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || "");

        const url = item.url.trim();

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
        // Category limit
        // ------------------------------------------

        if (categoryCounts[category] >= MAX_ARTICLES_PER_CATEGORY) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Duplicate check
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

        if (item.publishedAt) {
          const date = new Date(item.publishedAt);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        // ------------------------------------------
        // GNews source is publisher,
        // not necessarily article author.
        // ------------------------------------------

        const author = "";

        // ------------------------------------------
        // Save article
        // ------------------------------------------

        await NewsArticle.create({
          source: source._id,

          title,

          description,

          url,

          image: item.image || "",

          author,

          publishedAt,

          category,

          tags: [],

          fetchMethod: "api",

          contentHash,

          newsDate: new Date(),

          ai: {
            processed: false,
          },
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        /*
         * One article failure should not
         * stop the complete GNews fetch.
         */

        console.error(`❌ Article Error: ${item.title}`, articleError.message);
      }
    }

    // ==========================================
    // 6. RESULT
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
      `❌ GNews Error - ${source?.name || "GNews"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "GNews",

      message:
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message,
    };
  }
};
