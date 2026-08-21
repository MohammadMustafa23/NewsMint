import axios from "axios";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";
import { GUARDIAN_API_KEY } from "../../../config/env.js";

const GUARDIAN_URL = "https://content.guardianapis.com/search";

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
 * Guardian section → NewsMint category
 */
const CATEGORY_MAP = {
  politics: "India",

  "world news": "World",
  world: "World",

  business: "Business",

  technology: "Technology",
  tech: "Technology",

  sport: "Sports",
  sports: "Sports",

  culture: "Entertainment",
  film: "Entertainment",
  music: "Entertainment",
  television: "Entertainment",
};

/*
 * Convert Guardian section into
 * one of our NewsMint categories.
 */
const getCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return null;
  }

  const sectionName = cleanText(item.sectionName || "").toLowerCase();

  /*
   * 1. Exact match
   */
  const exactMatch = allowedCategories.find(
    (category) => category.toLowerCase() === sectionName,
  );

  if (exactMatch) {
    return exactMatch;
  }

  /*
   * 2. Mapped category
   */
  const mappedCategory = CATEGORY_MAP[sectionName];

  if (mappedCategory) {
    const allowedMatch = allowedCategories.find(
      (category) => category.toLowerCase() === mappedCategory.toLowerCase(),
    );

    if (allowedMatch) {
      return allowedMatch;
    }
  }

  /*
   * 3. Fallback
   */
  return allowedCategories[0];
};

export const fetchGuardianNews = async (source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!source) {
      throw new Error("Guardian source is required");
    }

    if (!GUARDIAN_API_KEY) {
      throw new Error("Guardian API key is not configured");
    }

    console.log(`\n📡 Fetching Guardian: ${source.name}`);

    // ==========================================
    // 2. API PARAMETERS
    // ==========================================

    const params = {
      "api-key": GUARDIAN_API_KEY,

      "page-size": MAX_API_ARTICLES,

      "order-by": "newest",

      /*
       * Only request fields we actually use.
       */
      "show-fields": "trailText,thumbnail,byline",

      "show-tags": "keyword",
    };

    // ==========================================
    // 3. API REQUEST
    // ==========================================

    const response = await axios.get(GUARDIAN_URL, {
      params,
      timeout: 15000,
    });

    const guardianResponse = response.data?.response;

    if (!guardianResponse) {
      throw new Error("Invalid Guardian API response");
    }

    const articles = Array.isArray(guardianResponse.results)
      ? guardianResponse.results
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

        if (!item.webTitle || !item.webUrl) {
          skipped++;
          continue;
        }

        const title = cleanText(item.webTitle);

        const description = cleanText(item.fields?.trailText || "");

        const url = item.webUrl.trim();

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

        if (item.webPublicationDate) {
          const date = new Date(item.webPublicationDate);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        // ------------------------------------------
        // Author
        // ------------------------------------------

        const author = cleanText(item.fields?.byline || "");

        // ------------------------------------------
        // Tags
        // ------------------------------------------

        const tags = Array.isArray(item.tags)
          ? item.tags
              .map((tag) => cleanText(tag.webTitle || ""))
              .filter(Boolean)
          : [];

        // ------------------------------------------
        // Save article
        // ------------------------------------------

        await NewsArticle.create({
          source: source._id,

          title,

          description,

          url,

          image: item.fields?.thumbnail || "",

          author,

          publishedAt,

          category,

          tags,

          fetchMethod: "api",

          contentHash,

          /*
           * Time when NewsMint fetched
           * this article.
           */
          newsDate: new Date(),

          ai: {
            processed: false,
          },
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        /*
         * Continue processing remaining
         * Guardian articles.
         */

        console.error(
          `❌ Article Error: ${item.webTitle}`,
          articleError.message,
        );
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
      `❌ Guardian Error - ${source?.name || "The Guardian"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "The Guardian",

      message: error.response?.data?.message || error.message,
    };
  }
};
