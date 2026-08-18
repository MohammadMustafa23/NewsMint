import Parser from "rss-parser";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";

const parser = new Parser({
  timeout: 15000,
});

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
 * Later we will replace this with real
 * category information from the source/API.
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
    "startup",
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

const detectCategory = (item, source) => {
  const allowedCategories = source.categories || [];

  if (!allowedCategories.length) {
    return "General";
  }

  const text = `
    ${item.title || ""}
    ${item.contentSnippet || ""}
    ${item.description || ""}
  `.toLowerCase();

  /*
   * Only detect categories that this source
   * actually supports.
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
   *
   * If we cannot identify the category from
   * the RSS item, use the first category
   * configured for the source.
   *
   * This will be replaced later with genuine
   * source/feed category information.
   */
  return allowedCategories[0];
};

const extractImage = (item) => {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }

  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }

  return "";
};

export const fetchRSSSource = async (source) => {
  try {
    if (!source.rssUrl) {
      throw new Error(`RSS URL not configured for ${source.name}`);
    }

    console.log(`Fetching RSS: ${source.name}`);

    const feed = await parser.parseURL(source.rssUrl);

    console.log(`${source.name}: ${feed.items.length} articles found`);

    let saved = 0;
    let skipped = 0;

    /*
     * Track how many articles we have stored
     * for each category during this fetch.
     */
    const categoryCounts = {};

    for (const category of source.categories || []) {
      categoryCounts[category] = 0;
    }

    for (const item of feed.items) {
      try {
        if (!item.title || !item.link) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(
          item.contentSnippet || item.content || item.description || "",
        );

        const url = item.link.trim();

        /*
         * Determine category.
         */
        const category = detectCategory(item, source);

        /*
         * Only allow categories configured
         * on this source.
         */
        if (!source.categories?.includes(category)) {
          skipped++;
          continue;
        }

        /*
         * Maximum 5 articles per category
         * for this source during this fetch.
         */
        if (categoryCounts[category] >= MAX_ARTICLES_PER_CATEGORY) {
          skipped++;
          continue;
        }

        /*
         * URL-based hash.
         *
         * This allows RSS/API providers to
         * detect the same article later.
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

        await NewsArticle.create({
          source: source._id,

          title,

          description,

          url,

          image: extractImage(item),

          author: item.creator || item.author || "",

          publishedAt,

          category,

          /*
           * Store only the source's allowed
           * categories as tags for now.
           */
          tags: source.categories || [],

          fetchMethod: "rss",

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
      total: feed.items.length,
      saved,
      skipped,
      categoryCounts,
    };
  } catch (error) {
    console.error(`RSS Error - ${source.name}:`, error.message);

    return {
      success: false,
      source: source.name,
      message: error.message,
    };
  }
};
