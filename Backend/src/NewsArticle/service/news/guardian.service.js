import axios from "axios";

import { GUARDIAN_API_KEY } from "../../../config/env.js";
import { CATEGORY_QUERIES } from "../contents/news.constants.js";

const GUARDIAN_URL = "https://content.guardianapis.com/search";

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

export const fetchGuardianNews = async (category, source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!category) {
      throw new Error("Category is required");
    }

    if (!source?._id) {
      throw new Error("Guardian Source document is required");
    }

    if (!GUARDIAN_API_KEY) {
      throw new Error("Guardian API key is not configured");
    }

    const query = CATEGORY_QUERIES[category];

    if (!query) {
      throw new Error(`No Guardian query configured for ${category}`);
    }

    console.log(`📡 Guardian → ${category}`);
    console.log(`🔎 Query: ${query}`);

    // ==========================================
    // 2. API PARAMETERS
    // ==========================================

    const params = {
      "api-key": GUARDIAN_API_KEY,

      q: query,

      "page-size": MAX_RESULTS,

      "order-by": "newest",

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

    const items = Array.isArray(guardianResponse.results)
      ? guardianResponse.results
      : [];

    console.log(`📰 Guardian → ${category}: ${items.length} raw candidates`);

    // ==========================================
    // 4. NORMALIZE
    // ==========================================

    const articles = items
      .map((item) => {
        if (!item.webTitle || !item.webUrl) {
          return null;
        }

        const title = cleanText(item.webTitle);

        const description = cleanText(item.fields?.trailText || "");

        const url = item.webUrl.trim();

        if (!title || !url) {
          return null;
        }

        // --------------------------------------
        // Published date
        // --------------------------------------

        const publishedAt = item.webPublicationDate
          ? new Date(item.webPublicationDate)
          : null;

        if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
          return null;
        }

        // --------------------------------------
        // Author
        // --------------------------------------

        const author = cleanText(item.fields?.byline || "");

        // --------------------------------------
        // Tags
        // --------------------------------------

        const tags = Array.isArray(item.tags)
          ? item.tags
              .map((tag) => cleanText(tag.webTitle || ""))
              .filter(Boolean)
          : [];

        // --------------------------------------
        // Normalized article
        // --------------------------------------

        return {
          source: source._id,

          sourceKey: "the-guardian",

          title,

          description,

          url,

          image: item.fields?.thumbnail || "",

          author,

          publishedAt,

          category,

          tags,

          fetchMethod: "api",
        };
      })
      .filter(Boolean);

    console.log(
      `📰 Guardian → ${category}: ${articles.length} valid candidates`,
    );

    return articles;
  } catch (error) {
    console.error(
      `❌ Guardian ${category}:`,
      error.response?.data || error.message,
    );

    return [];
  }
};
