import crypto from "crypto";

import Source from "../../Feature/NewsSource/models/source.models.js";
import NewsArticle from "../../NewsArticle/models/NewsArticle.js";

import { ALLOWED_CATEGORIES } from "../service/contents/news.constants.js";
import { CATEGORY_SOURCES } from "../service/contents/categorySources.js";

import { fetchGNews } from "../service/news/gnews.service.js";
import { fetchNewsData } from "../service/news/newsdata.service.js";
import { fetchMediaStackNews } from "../service/news/mediastack.service.js";
import { fetchRSSSource } from "../service/news/rss.service.js";

const ARTICLES_PER_CATEGORY = 10;
const SOURCE_DELAY = 1200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const createContentHash = (url) => {
  return crypto
    .createHash("sha256")
    .update(url.trim().toLowerCase())
    .digest("hex");
};

const SOURCE_FETCHERS = {
  gnews: fetchGNews,
  "newsdata-io": fetchNewsData,
  mediastack: fetchMediaStackNews,
  ndtv: fetchRSSSource,
  "hindustan-times": fetchRSSSource,
  "the-indian-express": fetchRSSSource,
  "india-today": fetchRSSSource,
};

const normalizeUrl = (url = "") => {
  try {
    const parsedUrl = new URL(url.trim());
    parsedUrl.hash = "";

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const param of trackingParams) {
      parsedUrl.searchParams.delete(param);
    }

    return parsedUrl.toString().toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
};

/*
 * ==========================================
 * NORMALIZE TITLE
 * ==========================================
 */

const normalizeTitle = (title = "") => {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

/*
 * ==========================================
 * REMOVE DUPLICATES
 * ==========================================
 *
 * Duplicate priority:
 *
 * 1. Same URL
 * 2. Same normalized title
 */

const deduplicateArticles = (articles) => {
  const seenUrls = new Set();

  const seenTitles = new Set();

  const uniqueArticles = [];

  for (const article of articles) {
    if (!article?.url || !article?.title) {
      continue;
    }

    const normalizedUrl = normalizeUrl(article.url);

    const normalizedTitle = normalizeTitle(article.title);

    if (!normalizedUrl || !normalizedTitle) {
      continue;
    }

    /*
     * Same article URL.
     */

    if (seenUrls.has(normalizedUrl)) {
      continue;
    }

    /*
     * Same article title from another source.
     */

    if (seenTitles.has(normalizedTitle)) {
      continue;
    }

    seenUrls.add(normalizedUrl);

    seenTitles.add(normalizedTitle);

    uniqueArticles.push(article);
  }

  return uniqueArticles;
};

/*
 * ==========================================
 * FETCH SOURCE FOR CATEGORY
 * ==========================================
 */

const fetchSourceForCategory = async (sourceKey, category) => {
  /*
   * ==========================================
   * 1. FIND FETCHER
   * ==========================================
   */

  const fetcher = SOURCE_FETCHERS[sourceKey];

  if (!fetcher) {
    console.warn(`[NEWS_SOURCE] No fetcher configured | source=${sourceKey}`);

    return [];
  }

  /*
   * ==========================================
   * 2. FIND SOURCE
   * ==========================================
   *
   * sourceKey is now always the Source.slug.
   *
   * Example:
   *
   * gnews
   * newsdata-io
   * the-guardian
   * ndtv
   * hindustan-times
   */

  const source = await Source.findOne({
    slug: sourceKey,

    isActive: true,
  });

  if (!source) {
    console.warn(
      `[NEWS_SOURCE] Active source not found | source=${sourceKey} | category=${category}`,
    );

    return [];
  }

  /*
   * ==========================================
   * 3. CATEGORY VALIDATION
   * ==========================================
   *
   * Make sure this source is configured
   * for the requested NewsMint category.
   */

  if (!source.categories?.includes(category)) {
    console.warn(
      `[NEWS_SOURCE] Category not configured | source=${source.name} | category=${category}`,
    );

    return [];
  }

  /*
   * ==========================================
   * 4. FETCH
   * ==========================================
   */

  try {
    /*
     * Every provider follows the same contract:
     *
     * fetcher(category, source)
     *
     * returns:
     *
     * articles[]
     */

    const startedAt = Date.now();

    console.log(
      `[NEWS_SOURCE] Fetch started | source=${source.name} | category=${category}`,
    );

    const articles = await fetcher(category, source);

    /*
     * Safety check.
     */

    if (!Array.isArray(articles)) {
      console.warn(
        `[NEWS_SOURCE] Invalid response | source=${source.name} | category=${category}`,
      );

      return [];
    }

    console.log(
      `[NEWS_SOURCE] Fetch completed | source=${source.name} | category=${category} | articles=${articles.length} | duration=${Date.now() - startedAt}ms`,
    );

    return articles;
  } catch (error) {
    console.error(
      `[NEWS_SOURCE] Fetch failed | source=${source.name} | category=${category} | message="${error.message}"`,
      error,
    );

    return [];
  }
};

/*
 * ==========================================
 * STORE ONE ARTICLE
 * ==========================================
 */

const storeArticle = async (article) => {
  if (!article?.url) {
    return {
      saved: false,
      reason: "invalid-url",
    };
  }

  /*
   * Normalize URL before creating hash.
   */

  const normalizedUrl = normalizeUrl(article.url);

  const contentHash = createContentHash(normalizedUrl);

  const result = await NewsArticle.updateOne(
    {
      contentHash,
    },
    {
      $setOnInsert: {
        source: article.source,

        title: article.title,

        description: article.description || "",

        url: article.url,

        image: article.image || "",

        author: article.author || "",

        publishedAt: article.publishedAt,

        category: article.category,

        tags: Array.isArray(article.tags) ? article.tags : [],

        fetchMethod: article.fetchMethod,

        contentHash,

        /*
         * Actual publication date.
         */

        newsDate: article.publishedAt || new Date(),

        /*
         * AI worker will pick this article later.
         */

        ai: {
          processed: false,

          status: "pending",

          attempts: 0,

          nextRetryAt: null,
        },
      },
    },
    {
      upsert: true,
      runValidators: true,
    },
  );

  if (!result.upsertedCount && !result.upsertedId) {
    return {
      saved: false,
      reason: "duplicate",
    };
  }

  return {
    saved: true,
  };
};

export const fetchCategoryNews = async (category) => {
  const startedAt = Date.now();

  /*
   * Validate category.
   */

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error(`Invalid NewsMint category: ${category}`);
  }

  /*
   * Get configured sources.
   */

  const configuredSources = CATEGORY_SOURCES[category] || [];

  console.log(
    `[NEWS_CATEGORY] Started | category=${category} | sources=${configuredSources.length}`,
  );

  if (!configuredSources.length) {
    console.warn(
      `[NEWS_CATEGORY] No sources configured | category=${category}`,
    );

    return {
      success: true,

      category,

      candidates: 0,

      unique: 0,

      selected: 0,

      saved: 0,

      duplicates: 0,
    };
  }

  let candidates = [];

  /*
   * Fetch sources sequentially.
   *
   * Important:
   * We don't use Promise.all here because
   * APIs can have rate limits.
   */

  for (const sourceKey of configuredSources) {
    const articles = await fetchSourceForCategory(sourceKey, category);

    candidates.push(...articles);

    /*
     * Small delay between providers.
     */

    await sleep(SOURCE_DELAY);
  }

  console.log(
    `[NEWS_CATEGORY] Sources completed | category=${category} | candidates=${candidates.length}`,
  );

  /*
   * ==========================================
   * SORT BY LATEST
   * ==========================================
   */

  candidates.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();

    const dateB = new Date(b.publishedAt).getTime();

    return dateB - dateA;
  });

  /*
   * ==========================================
   * DEDUPLICATE
   * ==========================================
   */

  const uniqueArticles = deduplicateArticles(candidates);

  console.log(
    `[NEWS_CATEGORY] Deduplication completed | category=${category} | candidates=${candidates.length} | unique=${uniqueArticles.length} | removed=${candidates.length - uniqueArticles.length}`,
  );

  /*
   * ==========================================
   * SELECT TOP 10
   * ==========================================
   */

  const selectedArticles = uniqueArticles.slice(0, ARTICLES_PER_CATEGORY);

  console.log(
    `[NEWS_CATEGORY] Articles selected | category=${category} | selected=${selectedArticles.length}`,
  );

  /*
   * ==========================================
   * SAVE TO DATABASE
   * ==========================================
   */

  let saved = 0;

  let duplicates = 0;

  for (const article of selectedArticles) {
    const result = await storeArticle(article);

    if (result.saved) {
      saved++;
    } else if (result.reason === "duplicate") {
      duplicates++;
    }
  }

  console.log(
    `[NEWS_CATEGORY] Completed | category=${category} | candidates=${candidates.length} | unique=${uniqueArticles.length} | selected=${selectedArticles.length} | saved=${saved} | duplicates=${duplicates} | duration=${Date.now() - startedAt}ms`,
  );

  return {
    success: true,

    category,

    candidates: candidates.length,

    unique: uniqueArticles.length,

    selected: selectedArticles.length,

    saved,

    duplicates,
  };
};

/*
 * ==========================================
 * FETCH ALL CATEGORIES
 * ==========================================
 *
 * THIS is what your daily cron calls.
 *
 * Example:
 *
 * await fetchAllNews();
 */

export const fetchAllNews = async () => {
  const startedAt = Date.now();

  const results = [];

  console.log(`[NEWS_FETCH] Started | categories=${ALLOWED_CATEGORIES.length}`);

  for (const category of ALLOWED_CATEGORIES) {
    try {
      const result = await fetchCategoryNews(category);

      results.push(result);
    } catch (error) {
      console.error(
        `[NEWS_FETCH] Category failed | category=${category} | message="${error.message}"`,
        error,
      );

      results.push({
        success: false,

        category,

        error: error.message,
      });
    }

    /*
     * Delay before next category.
     */

    await sleep(SOURCE_DELAY);
  }

  /*
   * ==========================================
   * TOTALS
   * ==========================================
   */

  const totalCandidates = results.reduce(
    (total, result) => total + (result.candidates || 0),
    0,
  );

  const totalSelected = results.reduce(
    (total, result) => total + (result.selected || 0),
    0,
  );

  const totalSaved = results.reduce(
    (total, result) => total + (result.saved || 0),
    0,
  );

  const failedCategories = results.filter(
    (result) => result.success === false,
  ).length;

  console.log(
    `[NEWS_FETCH] Completed | categories=${results.length} | failed=${failedCategories} | candidates=${totalCandidates} | selected=${totalSelected} | saved=${totalSaved} | duration=${Date.now() - startedAt}ms`,
  );

  return {
    success: true,

    categories: results.length,

    totalCandidates,

    totalSelected,

    totalSaved,

    results,
  };
};
