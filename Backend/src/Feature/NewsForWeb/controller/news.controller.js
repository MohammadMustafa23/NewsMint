import crypto from "node:crypto";

import Preference from "../../Preference/models/Preference.js";
import NewsArticle from "../../../NewsArticle/models/NewsArticle.js";

import { redisClient } from "../../../config/redis.js";

// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

const NEWS_CACHE_TTL = 5 * 60;

const PREFERENCE_CACHE_TTL = 30 * 60;

const CACHE_VERSION = "v1";

// ======================================================
// HELPERS
// ======================================================

const parseCachedObject = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// ======================================================
// RANDOM CACHE TTL
// Prevent many keys expiring together
// ======================================================

const getCacheTTL = (baseTTL) => {
  const jitter = Math.floor(Math.random() * 60);

  return baseTTL + jitter;
};

// ======================================================
// CREATE PREFERENCE SIGNATURE
// ======================================================

const createPreferenceSignature = ({
  categories = [],
  sources = [],
  language = "English",
}) => {
  const normalizedCategories = [...categories].map(String).sort();

  const normalizedSources = [...sources].map(String).sort();

  const rawValue = JSON.stringify({
    categories: normalizedCategories,
    sources: normalizedSources,
    language,
  });

  return crypto
    .createHash("sha256")
    .update(rawValue)
    .digest("hex")
    .slice(0, 16);
};

// ======================================================
// GET CACHED PREFERENCE
// ======================================================

const getUserPreference = async (userId) => {
  const cacheKey = `preference:user:${userId}`;

  const cachedPreference = parseCachedObject(await redisClient.get(cacheKey));

  if (cachedPreference) {
    return cachedPreference;
  }

  const preference = await Preference.findOne({
    userId,
  })
    .select("categories sources language updatedAt")
    .lean();

  if (!preference) {
    return null;
  }

  await redisClient.set(cacheKey, preference, {
    ex: getCacheTTL(PREFERENCE_CACHE_TTL),
  });

  return preference;
};

// ======================================================
// BUILD NEWS QUERY
// ======================================================

const buildNewsQuery = (preference) => {
  const { categories = [], sources = [] } = preference;

  const query = {
    category: {
      $in: categories,
    },

    "ai.status": "completed",
  };

  // ----------------------------------------------------
  // IMPORTANT
  //
  // If user selected sources:
  //     filter by those sources.
  //
  // If user did NOT select sources:
  //     DON'T restrict to top 5.
  //
  // This allows all active/available news matching
  // the user's categories.
  // ----------------------------------------------------

  if (sources.length > 0) {
    query.source = {
      $in: sources,
    };
  }

  return query;
};

// ======================================================
// FORMAT NEWS
// ======================================================

const formatNews = (articles, language) => {
  const summaryKey = language === "Hindi" ? "hindi" : "english";

  return articles.map((article) => ({
    id: article._id,

    title: article.title,

    description: article.description || "",

    summary: article.ai?.summary?.[summaryKey] || "",

    keyPoints: article.ai?.keyPoints?.[summaryKey] || [],

    image: article.image || "",

    author: article.author || "",

    url: article.url || "",

    category: article.category,

    tags: article.tags || [],

    publishedAt: article.publishedAt,

    newsDate: article.newsDate,

    source: article.source
      ? {
          id: article.source._id,

          name: article.source.name,

          shortName: article.source.shortName,

          logo: article.source.logo,

          website: article.source.website,
        }
      : null,
  }));
};

// ======================================================
// GET MY NEWS
// ======================================================

export const getMyNews = async (req, res) => {
  try {
    // ==================================================
    // 1. USER
    // ==================================================

    const userId = req.user._id.toString();

    // ==================================================
    // 2. PAGINATION
    // ==================================================

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const requestedLimit =
      Number.parseInt(req.query.limit, 10) || DEFAULT_LIMIT;

    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

    // ==================================================
    // 3. GET USER PREFERENCE
    // ==================================================

    const preference = await getUserPreference(userId);

    if (!preference) {
      return res.status(404).json({
        success: false,

        message: "User preferences not found.",
      });
    }

    const { categories = [], sources = [], language = "English" } = preference;

    // ==================================================
    // 4. EMPTY CATEGORY SAFETY
    // ==================================================

    if (!categories.length) {
      return res.status(200).json({
        success: true,

        data: {
          language,

          categories: [],

          news: [],

          pagination: {
            page,

            limit,

            hasMore: false,

            nextPage: null,
          },
        },

        cached: false,
      });
    }

    // ==================================================
    // 5. CACHE KEY
    //
    // Preference signature means if user changes
    // categories/sources/language, the cache namespace
    // automatically changes.
    // ==================================================

    const preferenceSignature = createPreferenceSignature({
      categories,

      sources,

      language,
    });

    const cacheKey =
      `news:${CACHE_VERSION}:user:${userId}` +
      `:pref:${preferenceSignature}` +
      `:page:${page}`;

    // ==================================================
    // 6. REDIS CACHE
    //
    // Cache only the first few pages.
    // Don't allow unlimited per-user Redis growth.
    // ==================================================

    const shouldCache = page <= 3;

    if (shouldCache) {
      const cachedNews = parseCachedObject(await redisClient.get(cacheKey));

      if (cachedNews) {
        return res.status(200).json({
          success: true,

          data: cachedNews,

          cached: true,
        });
      }
    }

    // ==================================================
    // 7. BUILD QUERY
    // ==================================================

    const query = buildNewsQuery(preference);

    // ==================================================
    // 8. OFFSET PAGINATION
    //
    // Current UI uses page numbers.
    //
    // Fetch one extra record to determine hasMore.
    // ==================================================

    const skip = (page - 1) * limit;

    const articles = await NewsArticle.find(query)
      .sort({
        newsDate: -1,

        _id: -1,
      })

      .skip(skip)

      .limit(limit + 1)

      .populate("source", "name shortName logo website")

      .lean();

    // ==================================================
    // 9. HAS MORE
    // ==================================================

    const hasMore = articles.length > limit;

    const pageArticles = hasMore ? articles.slice(0, limit) : articles;

    // ==================================================
    // 10. FORMAT
    // ==================================================

    const news = formatNews(pageArticles, language);

    // ==================================================
    // 11. RESPONSE
    // ==================================================

    const responseData = {
      language,

      categories,

      news,

      pagination: {
        page,

        limit,

        hasMore,

        nextPage: hasMore ? page + 1 : null,
      },
    };

    // ==================================================
    // 12. CACHE
    // ==================================================

    if (shouldCache) {
      await redisClient.set(
        cacheKey,

        responseData,

        {
          ex: getCacheTTL(NEWS_CACHE_TTL),
        },
      );
    }

    // ==================================================
    // 13. RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      data: responseData,

      cached: false,
    });
  } catch (error) {
    console.error("getMyNews error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to load your news right now.",
    });
  }
};
