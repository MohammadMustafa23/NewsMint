import NewsArticle from "../../../NewsArticle/models/NewsArticle.js";
import { redisClient } from "../../../config/redis.js";
// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

// ======================================================
// HELPERS
// ======================================================

const parsePage = (value) => {
  const page = Number.parseInt(value, 10);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
};

const parseLimit = (value) => {
  const limit = Number.parseInt(value, 10);

  if (!Number.isFinite(limit) || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(limit, MAX_LIMIT);
};

// ======================================================
// FORMAT NEWS
// ======================================================

const formatNews = (articles) => {
  return articles.map((article) => ({
    id: article._id,

    title: article.title,

    description: article.description || "",

    summary: {
      english: article.ai?.summary?.english || "",

      hindi: article.ai?.summary?.hindi || "",
    },

    keyPoints: {
      english: article.ai?.keyPoints?.english || [],

      hindi: article.ai?.keyPoints?.hindi || [],
    },

    image: article.image || "",

    author: article.author || "",

    url: article.url || "",

    category: article.category,

    tags: article.tags || [],

    publishedAt: article.publishedAt || null,

    newsDate: article.newsDate || null,

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
// GET CATEGORY NEWS
// ======================================================
//
// GET /category-news
//
// Query:
//
// category = India
// page     = 1
// limit    = 10
//
// ======================================================
export const getCategoryNews = async (req, res) => {
  try {
    // ==================================================
    // 1. CATEGORY
    // ==================================================

    const category =
      typeof req.query.category === "string" ? req.query.category.trim() : "";

    // ==================================================
    // 2. VALIDATE CATEGORY
    // ==================================================

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "News category is required.",
      });
    }

    // ==================================================
    // 3. PAGINATION
    // ==================================================

    const page = parsePage(req.query.page);

    const limit = parseLimit(req.query.limit);

    const skip = (page - 1) * limit;

    // ==================================================
    // 4. REDIS CACHE KEY
    // ==================================================

    const cacheKey = `news:category:${category}:${page}:${limit}`;

    // ==================================================
    // 5. CHECK REDIS CACHE
    // ==================================================

    const cachedNews = await redisClient.get(cacheKey);

    if (cachedNews) {
      return res.status(200).json(cachedNews);
    }

    // ==================================================
    // 6. QUERY
    // ==================================================

    const query = {
      category,

      "ai.status": "completed",
    };

    // ==================================================
    // 7. FETCH NEWS
    // ==================================================

    const articles = await NewsArticle.find(query)
      .sort({
        newsDate: -1,

        publishedAt: -1,

        _id: -1,
      })
      .skip(skip)
      .limit(limit + 1)
      .populate("source", "name shortName logo website")
      .lean();

    // ==================================================
    // 8. HAS MORE
    // ==================================================

    const hasMore = articles.length > limit;

    const pageArticles = hasMore ? articles.slice(0, limit) : articles;

    // ==================================================
    // 9. FORMAT
    // ==================================================

    const news = formatNews(pageArticles);

    // ==================================================
    // 10. RESPONSE DATA
    // ==================================================

    const responseData = {
      success: true,

      data: {
        category,

        news,

        pagination: {
          page,

          limit,

          hasMore,

          nextPage: hasMore ? page + 1 : null,
        },
      },
    };

    // ==================================================
    // 11. SAVE TO REDIS
    // ==================================================
    //
    // 1800 seconds = 30 minutes
    //
    // ==================================================

    await redisClient.set(cacheKey, responseData, {
      ex: 1800,
    });

    // ==================================================
    // 12. RESPONSE
    // ==================================================

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("getCategoryNews error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to load category news right now.",
    });
  }
};
// ======================================================
// GET TOP NEWS
// ======================================================
//
// GET /top-news
//
// Query:
//
// page  = 1
// limit = 10
//
// Returns latest news from ALL categories.
//
// ======================================================

export const getTopNews = async (req, res) => {
  try {
    // ==================================================
    // 1. PAGINATION
    // ==================================================

    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);

    // ==================================================
    // 2. REDIS CACHE KEY
    // ==================================================

    const cacheKey = `news:top:${page}:${limit}`;

    // ==================================================
    // 3. CHECK REDIS
    // ==================================================

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // ==================================================
    // 4. QUERY
    // ==================================================

    const skip = (page - 1) * limit;

    const query = {
      "ai.status": "completed",
    };

    // ==================================================
    // 5. FETCH NEWS
    // ==================================================

    const articles = await NewsArticle.find(query)
      .sort({
        newsDate: -1,
        publishedAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit + 1)
      .populate("source", "name shortName logo website")
      .lean();

    // ==================================================
    // 6. HAS MORE
    // ==================================================

    const hasMore = articles.length > limit;

    const pageArticles = hasMore ? articles.slice(0, limit) : articles;

    // ==================================================
    // 7. FORMAT
    // ==================================================

    const news = formatNews(pageArticles);

    // ==================================================
    // 8. RESPONSE DATA
    // ==================================================

    const responseData = {
      success: true,

      data: {
        news,

        pagination: {
          page,
          limit,
          hasMore,
          nextPage: hasMore ? page + 1 : null,
        },
      },
    };

    // ==================================================
    // 9. SAVE TO REDIS
    // ==================================================
    //
    // Cache for 30 minutes
    //
    // 1800 seconds = 30 minutes
    //
    // ==================================================

    await redisClient.set(cacheKey, responseData, {
      ex: 1800,
    });

    // ==================================================
    // 10. RESPONSE
    // ==================================================

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("getTopNews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load top news right now.",
    });
  }
};
