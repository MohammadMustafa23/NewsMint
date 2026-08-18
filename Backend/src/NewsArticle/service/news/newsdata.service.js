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
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

/*
 * TEMPORARY
 *
 * NewsData already provides categories,
 * so we first try to use the API category.
 *
 * Later we can improve category mapping
 * when the complete category system is ready.
 */
const getCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return null;
  }

  const apiCategories = Array.isArray(item.category) ? item.category : [];

  /*
   * Find the first API category that exists
   * in our Source categories.
   */
  const matchedCategory = apiCategories.find((category) =>
    allowedCategories.some(
      (allowedCategory) =>
        allowedCategory.toLowerCase() === category.toLowerCase(),
    ),
  );

  if (matchedCategory) {
    return allowedCategories.find(
      (allowedCategory) =>
        allowedCategory.toLowerCase() === matchedCategory.toLowerCase(),
    );
  }

  /*
   * TEMPORARY FALLBACK
   *
   * If NewsData category doesn't match our
   * current Source categories, use the first
   * allowed category.
   */
  return allowedCategories[0];
};

export const fetchNewsData = async (source) => {
  try {
    if (!source) {
      throw new Error("NewsData source is required");
    }

    if (!NEWSDATA_API_KEY) {
      throw new Error("NewsData API key is not configured");
    }

    console.log(`Fetching API: ${source.name}`);

    const response = await axios.get(NEWSDATA_URL, {
      params: {
        apikey: NEWSDATA_API_KEY,
        country: "in",
        language: "en",
      },

      timeout: 15000,
    });

    const articles = response.data.results || [];

    console.log(`${source.name}: ${articles.length} articles found`);

    let saved = 0;
    let skipped = 0;

    /*
     * Track how many articles we save
     * for each category.
     */
    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    for (const item of articles) {
      try {
        if (!item.title || !item.link) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || "");

        const url = item.link.trim();

        /*
         * Determine category.
         */
        const category = getCategory(item, source);

        /*
         * No valid category.
         */
        if (!category) {
          skipped++;
          continue;
        }

        /*
         * Maximum 5 articles per category.
         */
        if (categoryCounts[category] >= MAX_ARTICLES_PER_CATEGORY) {
          skipped++;
          continue;
        }

        /*
         * URL based duplicate hash.
         */
        const contentHash = createContentHash(url);

        const exists = await NewsArticle.exists({
          contentHash,
        });

        if (exists) {
          skipped++;
          continue;
        }

        let publishedAt = null;

        if (item.pubDate) {
          const date = new Date(item.pubDate);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        const author = Array.isArray(item.creator)
          ? item.creator[0] || ""
          : item.creator || "";

        const tags = Array.isArray(item.keywords) ? item.keywords : [];

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

          newsDate: new Date(),
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        console.error(`Article Error: ${item.title}`, articleError.message);
      }
    }

    console.log(`${source.name} category counts:`, categoryCounts);

    return {
      success: true,

      source: source.name,

      total: articles.length,

      saved,

      skipped,

      categoryCounts,
    };
  } catch (error) {
    console.error(
      `NewsData Error - ${source?.name || "NewsData.io"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "NewsData.io",

      message: error.response?.data?.message || error.message,
    };
  }
};
