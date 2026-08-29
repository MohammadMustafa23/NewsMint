import NewsArticle from "../../models/NewsArticle.js";
import Preference from "../../../Feature/Preference/models/Preference.js";

const MAX_NEWS = 10;

export const generateUserDigest = async (userId) => {
  try {
    // =================================
    // 1. FIND USER PREFERENCE
    // =================================

    const preference = await Preference.findOne({
      userId,
      isCompleted: true,
    }).lean();

    if (!preference) {
      return {
        success: false,
        message: "User preference not found",
        digest: "",
      };
    }


    // =================================
    // 2. EXTRACT USER PREFERENCES
    // =================================

    const categories = preference.categories || [];

    const language =
      preference.language?.toLowerCase() === "english" ? "english" : "hindi";

    if (!categories.length) {
      return {
        success: false,
        message: "User has no selected categories",
        digest: "",
      };
    }

    // =================================
    // 3. FETCH NEWS FROM DATABASE
    // =================================

    const articles = await NewsArticle.find({
      "ai.processed": true,

      category: {
        $in: categories,
      },

      "ai.summary.english": {
        $nin: ["", null],
      },

      "ai.summary.hindi": {
        $nin: ["", null],
      },
    })
      .sort({
        publishedAt: -1,
      })
      .limit(MAX_NEWS)
      .lean();

    // =================================
    // 4. NO NEWS
    // =================================

    if (!articles.length) {
      return {
        success: true,
        message: "No matching news found",
        count: 0,
        digest: "",
      };
    }

    // =================================
    // 5. GROUP NEWS BY CATEGORY
    // =================================

    const groupedNews = {};

    for (const article of articles) {
      const category = article.category || "General";

      if (!groupedNews[category]) {
        groupedNews[category] = [];
      }

      groupedNews[category].push(article);
    }

    // =================================
    // 6. BUILD DIGEST
    // =================================

    const lines = [];

    lines.push("📰 NewsMint Daily Digest");
    lines.push("");

    for (const [category, news] of Object.entries(groupedNews)) {
      lines.push(`📁 ${category.toUpperCase()}`);
      lines.push("");

      news.forEach((article, index) => {
        const summary =
          language === "english"
            ? article.ai.summary.english
            : article.ai.summary.hindi;

        lines.push(`${index + 1}. ${article.title}`);

        lines.push(summary);

        lines.push("");
      });

      lines.push("━━━━━━━━━━━━━━");
      lines.push("");
    }

    // =================================
    // 7. RETURN FINAL MESSAGE
    // =================================

    return {
      success: true,
      count: articles.length,
      categories,
      language,
      phoneNumber: preference.phoneNumber,
      digest: lines.join("\n").trim(),
      articles: articles.map((article) => ({
        id: article._id,
        title: article.title,
        category: article.category,
      })),
    };
  } catch (error) {
    console.error("User Digest Error:", error.message);

    throw error;
  }
};
