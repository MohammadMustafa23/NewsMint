import axios from "axios";

import { NEWSDATA_API_KEY } from "../../../config/env.js";
import { CATEGORY_QUERIES } from "../contents/news.constants.js";

const NEWSDATA_URL = "https://newsdata.io/api/1/latest";

const MAX_RESULTS = 10;

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
 * NewsData categories that closely match
 * our NewsMint categories.
 *
 * Categories not present here will use
 * keyword search through CATEGORY_QUERIES.
 */
const CATEGORY_MAP = {
  Business: "business",
  Technology: "technology",
  Sports: "sports",
  Entertainment: "entertainment",
  World: "world",
  Health: "health",
  Science: "science",
};

export const fetchNewsData = async (category, source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!category) {
      throw new Error("Category is required");
    }

    if (!source?._id) {
      throw new Error("NewsData Source document is required");
    }

    if (!NEWSDATA_API_KEY) {
      throw new Error("NewsData API key is not configured");
    }

    const query = CATEGORY_QUERIES[category];

    if (!query) {
      throw new Error(`No NewsData query configured for ${category}`);
    }

    console.log(`📡 NewsData → ${category}`);

    // ==========================================
    // 2. BUILD PARAMETERS
    // ==========================================

    const params = {
      apikey: NEWSDATA_API_KEY,

      country: "in",

      language: "en",

      removeduplicate: 1,

      size: MAX_RESULTS,
    };

    /*
     * Use NewsData's native category only when
     * it closely represents the NewsMint category.
     *
     * Otherwise use our NewsMint keyword query.
     */

    const newsDataCategory = CATEGORY_MAP[category];

    if (newsDataCategory) {
      params.category = newsDataCategory;
    } else {
      params.q = query;
    }

    // ==========================================
    // 3. API REQUEST
    // ==========================================

    const response = await axios.get(NEWSDATA_URL, {
      params,
      timeout: 15000,
    });

    if (response.data?.status !== "success") {
      throw new Error(
        response.data?.message ||
          "NewsData API returned an unsuccessful response",
      );
    }

    const items = Array.isArray(response.data?.results)
      ? response.data.results
      : [];

    console.log(`📰 NewsData → ${category}: ${items.length} raw candidates`);

    // ==========================================
    // 4. NORMALIZE
    // ==========================================

    const articles = items
      .map((item) => {
        if (!item.title || !item.link) {
          return null;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || item.content || "");

        const url = item.link.trim();

        if (!title || !url) {
          return null;
        }

        // ------------------------------------------
        // Published date
        // ------------------------------------------

        const publishedAt = item.pubDate ? new Date(item.pubDate) : null;

        if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
          return null;
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

        const tags = Array.isArray(item.keywords)
          ? item.keywords.map((tag) => cleanText(tag)).filter(Boolean)
          : [];

        // ------------------------------------------
        // Normalized article
        // ------------------------------------------

        return {
          source: source._id,

          sourceKey: "newsdata-io",

          title,

          description,

          url,

          image: item.image_url || "",

          author,

          publishedAt,

          category,

          tags,

          fetchMethod: "api",
        };
      })
      .filter(Boolean);

    console.log(
      `📰 NewsData → ${category}: ${articles.length} valid candidates`,
    );

    return articles;
  } catch (error) {
    console.error(
      `❌ NewsData ${category}:`,
      error.response?.data || error.message,
    );

    return [];
  }
};
