import axios from "axios";

import { GNEWS_API_KEY } from "../../../config/env.js";
import { CATEGORY_QUERIES } from "../contents/news.constants.js";

const GNEWS_URL = "https://gnews.io/api/v4/search";

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

export const fetchGNews = async (category, source) => {
  try {
    if (!category) {
      throw new Error("Category is required");
    }

    if (!source?._id) {
      throw new Error("GNews Source document is required");
    }

    if (!GNEWS_API_KEY) {
      throw new Error("GNews API key is not configured");
    }

    const query = CATEGORY_QUERIES[category];

    if (!query) {
      throw new Error(`No GNews query configured for ${category}`);
    }

    console.log(`📡 GNews → ${category}`);

    const response = await axios.get(GNEWS_URL, {
      params: {
        apikey: GNEWS_API_KEY,
        q: query,
        country: "in",
        lang: "en",
        max: MAX_RESULTS,
        sortby: "publishedAt",
      },
      timeout: 15000,
    });

    const items = Array.isArray(response.data?.articles)
      ? response.data.articles
      : [];

    const articles = items
      .map((item) => {
        if (!item.title || !item.url) {
          return null;
        }

        const publishedAt = item.publishedAt
          ? new Date(item.publishedAt)
          : null;

        if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
          return null;
        }

        return {
          source: source._id,

          sourceKey: "gnews",

          title: cleanText(item.title),

          description: cleanText(item.description || ""),

          url: item.url.trim(),

          image: item.image || "",

          author: "",

          publishedAt,

          category,

          tags: [],

          fetchMethod: "api",
        };
      })
      .filter(Boolean);

    console.log(`📰 GNews → ${category}: ${articles.length} candidates`);

    return articles;
  } catch (error) {
    console.error(
      `❌ GNews ${category}:`,
      error.response?.data || error.message,
    );

    return [];
  }
};
