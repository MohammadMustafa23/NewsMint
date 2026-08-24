import axios from "axios";

import { MEDIASTACK_API_KEY } from "../../../config/env.js";
import { CATEGORY_QUERIES } from "../contents/news.constants.js";

const MEDIASTACK_URL = "https://api.mediastack.com/v1/news";

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

export const fetchMediaStackNews = async (category, source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!category) {
      throw new Error("Category is required");
    }

    if (!source?._id) {
      throw new Error("Mediastack Source document is required");
    }

    if (!MEDIASTACK_API_KEY) {
      throw new Error("Mediastack API key is not configured");
    }

    const query = CATEGORY_QUERIES[category];

    if (!query) {
      throw new Error(`No Mediastack query configured for ${category}`);
    }

    console.log(`📡 Mediastack → ${category}`);

    // ==========================================
    // 2. API PARAMETERS
    // ==========================================

    const params = {
      access_key: MEDIASTACK_API_KEY,

      keywords: query,

      countries: "in",

      languages: "en",

      limit: MAX_RESULTS,

      sort: "published_desc",
    };

    // ==========================================
    // 3. API REQUEST
    // ==========================================

    const response = await axios.get(MEDIASTACK_URL, {
      params,
      timeout: 15000,
    });

    // ==========================================
    // 4. RESPONSE VALIDATION
    // ==========================================

    if (response.data?.error) {
      throw new Error(
        response.data.error.message || "Mediastack API returned an error",
      );
    }

    const items = Array.isArray(response.data?.data) ? response.data.data : [];

    // ==========================================
    // 5. NORMALIZE
    // ==========================================

    const articles = items
      .map((item) => {
        if (!item.title || !item.url) {
          return null;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || "");

        const url = item.url.trim();

        if (!title || !url) {
          return null;
        }

        const publishedAt = item.published_at
          ? new Date(item.published_at)
          : null;

        if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
          return null;
        }

        return {
          source: source._id,

          sourceKey: "mediastack",

          title,

          description,

          url,

          image: item.image || "",

          author: cleanText(item.author || ""),

          publishedAt,

          category,

          tags: [],

          fetchMethod: "api",
        };
      })
      .filter(Boolean);

    console.log(`📰 Mediastack → ${category}: ${articles.length} candidates`);

    return articles;
  } catch (error) {
    console.error(
      `❌ Mediastack ${category}:`,
      error.response?.data || error.message,
    );

    return [];
  }
};
