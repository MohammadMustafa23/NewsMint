import Parser from "rss-parser";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";

const parser = new Parser({
  timeout: 15000,
});

const MAX_ARTICLES_PER_CATEGORY = 5;

// NewsMint scheduler runs twice a day.
// Keep a 24-hour window so delayed RSS feeds
// don't cause valid news to be missed.
const NEWS_LOOKBACK_HOURS = 24;

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

  for (const category of allowedCategories) {
    const keywords = CATEGORY_KEYWORDS[category] || [];

    const matched = keywords.some((keyword) =>
      text.includes(keyword.toLowerCase()),
    );

    if (matched) {
      return category;
    }
  }

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
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!source) {
      throw new Error("RSS source is required");
    }

    if (!source.rssUrl) {
      throw new Error(`RSS URL not configured for ${source.name}`);
    }

    console.log(`\n📡 Fetching RSS: ${source.name}`);

    // ==========================================
    // 2. FETCH RSS
    // ==========================================

    const feed = await parser.parseURL(source.rssUrl);

    console.log(`📰 ${source.name}: ${feed.items.length} RSS items found`);

    // ==========================================
    // 3. TIME WINDOW
    // ==========================================

    const now = new Date();

    const since = new Date(
      now.getTime() - NEWS_LOOKBACK_HOURS * 60 * 60 * 1000,
    );

    console.log(
      `🕐 Looking for news from ${since.toISOString()} to ${now.toISOString()}`,
    );

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
    // 5. SORT RSS ITEMS BY PUBLISHED DATE
    // ==========================================

    const sortedItems = [...feed.items].sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;

      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;

      return dateB - dateA;
    });

    // ==========================================
    // 6. PROCESS ARTICLES
    // ==========================================

    for (const item of sortedItems) {
      try {
        // ------------------------------------------
        // Basic validation
        // ------------------------------------------

        if (!item.title || !item.link) {
          skipped++;
          continue;
        }

        const title = cleanText(item.title);

        const description = cleanText(
          item.contentSnippet || item.content || item.description || "",
        );

        const url = item.link.trim();

        if (!title || !url) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Published date
        // ------------------------------------------

        let publishedAt = null;

        if (item.pubDate) {
          const date = new Date(item.pubDate);

          if (!Number.isNaN(date.getTime())) {
            publishedAt = date;
          }
        }

        /*
         * If RSS does not provide a valid date,
         * skip the article.
         *
         * This is important because we cannot
         * verify whether it is actually latest.
         */
        if (!publishedAt) {
          console.log(`⏭️ No valid publication date: ${title}`);

          skipped++;
          continue;
        }

        // ------------------------------------------
        // Latest news filter
        // ------------------------------------------

        if (publishedAt < since) {
          skipped++;
          continue;
        }

        // Future-dated RSS article
        if (publishedAt > now) {
          skipped++;
          continue;
        }

        // ------------------------------------------
        // Category
        // ------------------------------------------

        const category = detectCategory(item, source);

        if (!source.categories?.includes(category)) {
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
        // Save article
        // ------------------------------------------

        await NewsArticle.create({
          source: source._id,

          title,

          description,

          url,

          image: extractImage(item),

          author: item.creator || item.author || "",

          publishedAt,

          category,

          tags: source.categories || [],

          fetchMethod: "rss",

          contentHash,

          /*
           * Time when NewsMint fetched
           * the article.
           */
          newsDate: now,

          ai: {
            processed: false,
          },
        });

        categoryCounts[category]++;

        saved++;
      } catch (articleError) {
        /*
         * One bad RSS article should not
         * stop the complete source.
         */

        console.error(`❌ Article Error: ${item.title}`, articleError.message);
      }
    }

    // ==========================================
    // 7. RESULT
    // ==========================================

    console.log(`📊 ${source.name} category counts:`, categoryCounts);

    console.log(`✅ ${source.name} | Saved: ${saved} | Skipped: ${skipped}`);

    return {
      success: true,

      source: source.name,

      total: feed.items.length,

      saved,

      skipped,

      categoryCounts,
    };
  } catch (error) {
    console.error(`❌ RSS Error - ${source?.name || "RSS"}:`, error.message);

    return {
      success: false,

      source: source?.name || "RSS",

      message: error.message,
    };
  }
};
