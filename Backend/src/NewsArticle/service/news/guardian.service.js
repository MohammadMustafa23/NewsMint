import axios from "axios";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";
import { GUARDIAN_API_KEY } from "../../../config/env.js";

const GUARDIAN_URL = "https://content.guardianapis.com/search";

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
 * TEMPORARY CATEGORY MAPPING
 *
 * Guardian section names do not always exactly
 * match our NewsMint categories.
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

const getCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return null;
  }

  const sectionName = (item.sectionName || "").trim().toLowerCase();

  /*
   * Exact match first.
   */
  const exactMatch = allowedCategories.find(
    (category) => category.toLowerCase() === sectionName,
  );

  if (exactMatch) {
    return exactMatch;
  }

  /*
   * Temporary mapping.
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
   * TEMPORARY FALLBACK
   *
   * If Guardian's section doesn't match
   * our current categories, use first allowed
   * category.
   */
  return allowedCategories[0];
};

export const fetchGuardianNews = async (source) => {
  try {
    if (!source) {
      throw new Error("Guardian source is required");
    }

    if (!GUARDIAN_API_KEY) {
      throw new Error("Guardian API key is not configured");
    }

    console.log(`Fetching API: ${source.name}`);

    const response = await axios.get(GUARDIAN_URL, {
      params: {
        "api-key": GUARDIAN_API_KEY,

        "page-size": 20,

        "order-by": "newest",

        "show-fields": "trailText,thumbnail,byline",

        "show-tags": "keyword",
      },

      timeout: 15000,
    });

    const articles = response.data.response?.results || [];

    console.log(`${source.name}: ${articles.length} articles found`);

    let saved = 0;
    let skipped = 0;

    /*
     * Track category limits.
     */
    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    for (const item of articles) {
      try {
        if (!item.webTitle || !item.webUrl) {
          skipped++;
          continue;
        }

        const title = cleanText(item.webTitle);

        const description = cleanText(item.fields?.trailText || "");

        const url = item.webUrl.trim();

        /*
         * Determine NewsMint category.
         */
        const category = getCategory(item, source);

        if (!category) {
          skipped++;
          continue;
        }

        /*
         * Maximum 5 per category.
         */
        if (categoryCounts[category] >= MAX_ARTICLES_PER_CATEGORY) {
          skipped++;
          continue;
        }

        /*
         * URL-based duplicate detection.
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

        if (item.webPublicationDate) {
          const date = new Date(item.webPublicationDate);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        const author = cleanText(item.fields?.byline || "");

        const tags = Array.isArray(item.tags)
          ? item.tags.map((tag) => tag.webTitle).filter(Boolean)
          : [];

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

          newsDate: new Date(),
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        console.error(`Article Error: ${item.webTitle}`, articleError.message);
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
      `Guardian Error - ${source?.name || "The Guardian"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "The Guardian",

      message: error.response?.data?.message || error.message,
    };
  }
};
