import axios from "axios";
import crypto from "crypto";

import { GNEWS_API_KEY } from "../../../config/env.js";
import NewsArticle from "../../models/NewsArticle.js";

const GNEWS_URL = "https://gnews.io/api/v4/top-headlines";

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
 * TEMPORARY CATEGORY DETECTION
 *
 * GNews response does not currently give us
 * a reliable NewsMint category.
 *
 * So we detect category from title +
 * description.
 */
const CATEGORY_KEYWORDS = {
  India: [
    "india",
    "indian",
    "delhi",
    "mumbai",
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
   * Only search through categories that
   * this Source actually supports.
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
   * TEMPORARY FALLBACK
   */
  return allowedCategories[0];
};

export const fetchGNews = async (source) => {
  try {
    if (!source) {
      throw new Error("GNews source is required");
    }

    if (!GNEWS_API_KEY) {
      throw new Error("GNews API key is not configured");
    }

    console.log(`Fetching API: ${source.name}`);

    const response = await axios.get(GNEWS_URL, {
      params: {
        apikey: GNEWS_API_KEY,
        country: "in",
        lang: "en",
        max: 10,
      },

      timeout: 15000,
    });

    const articles = response.data.articles || [];

    console.log(`${source.name}: ${articles.length} articles found`);

    let saved = 0;
    let skipped = 0;

    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    for (const item of articles) {
      try {
        if (!item.title || !item.url) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(item.description || "");

        const url = item.url.trim();

        /*
         * Determine category.
         */
        const category = getCategory(item, source);

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
         * URL based duplicate check.
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

        if (item.publishedAt) {
          const date = new Date(item.publishedAt);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        /*
         * GNews source.name is the publisher,
         * NOT the article author.
         */
        const author = "";

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
      `GNews Error - ${source?.name || "GNews"}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,

      source: source?.name || "GNews",

      message: error.response?.data?.message || error.message,
    };
  }
};
