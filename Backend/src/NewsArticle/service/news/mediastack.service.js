import axios from "axios";
import { MEDIASTACK_API_KEY } from "../../../config/env.js";
const MEDIASTACK_URL = "https://api.mediastack.com/v1/news";
const MAX_RESULTS = 10;

// ==========================================
// MEDIASTACK NATIVE CATEGORIES
// ==========================================

const MEDIASTACK_CATEGORY_MAP = {
  India: "general",
  Technology: "technology",
  Business: "business",
  Science: "science",
  Health: "health",
  Sports: "sports",
  Entertainment: "entertainment",
};

// ==========================================
// MEDIASTACK KEYWORDS
// ==========================================

const MEDIASTACK_KEYWORDS = {
  India: "India",

  Technology: "technology,software,gadgets",

  "Artificial Intelligence":
    "artificial intelligence,AI,machine learning,LLM,OpenAI,Gemini",

  Business: "business,companies,economy",

  "Finance & Markets": "stock market,finance,banking,NSE,BSE,Sensex,Nifty",

  World: "world,international,global",

  Science: "science,research,discovery",

  Space: "space,NASA,ISRO,astronomy,SpaceX,satellite",

  Cybersecurity: "cybersecurity,cyber attack,data breach,hacking,malware",

  Startups: "startups,startup funding,entrepreneurship,venture capital",

  "Education & Careers": "education,jobs,careers,students,recruitment",

  Health: "health,medicine,healthcare",

  Sports: "sports,cricket,football",

  Entertainment: "entertainment,movies,music,OTT,television",

  "Environment & Climate":
    "climate,environment,sustainability,global warming,pollution",
};

// ==========================================
// CLEAN TEXT
// ==========================================

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

// ==========================================
// FETCH MEDIASTACK NEWS
// ==========================================

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

    const query = MEDIASTACK_KEYWORDS[category];

    if (!query) {
      throw new Error(`No MediaStack query configured for ${category}`);
    }

   

    // ==========================================
    // 2. BASE PARAMETERS
    // ==========================================

    const params = {
      access_key: MEDIASTACK_API_KEY,

      countries: "in",

      languages: "en",

      limit: MAX_RESULTS,

      sort: "published_desc",
    };

    // ==========================================
    // 3. CATEGORY / KEYWORD FILTER
    // ==========================================

    const mediaStackCategory = MEDIASTACK_CATEGORY_MAP[category];

    if (mediaStackCategory) {
      // MediaStack native category
      params.categories = mediaStackCategory;
    } else {
      // Custom NewsMint category
      params.keywords = query;
    }


    const response = await axios.get(MEDIASTACK_URL, {
      params,
      timeout: 15000,
    });

    // ==========================================
    // 5. RESPONSE VALIDATION
    // ==========================================

    if (response.data?.error) {
      throw new Error(
        response.data.error.message || "Mediastack API returned an error",
      );
    }

    const items = Array.isArray(response.data?.data) ? response.data.data : [];

    // ==========================================
    // 6. NORMALIZE
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

    // ==========================================
    // 7. RESULT
    // ==========================================
    return articles;
  } catch (error) {
    console.error(
      `❌ Mediastack ${category}:`,
      error.response?.data || error.message,
    );

    return [];
  }
};
