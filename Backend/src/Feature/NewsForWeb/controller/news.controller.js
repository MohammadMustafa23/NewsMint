import Preference from "../../Prefrence/models/Preference.js";
import NewsArticle from "../../../NewsArticle/models/NewsArticle.js";
import Source from "../../NewsSource/models/source.models.js";

export const getMyNews = async (req, res) => {
  try {
    // 1. Logged-in user
    const userId = req.user._id;

    // 2. Get user preference
    const preference = await Preference.findOne({ userId }).lean();

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "User preferences not found",
      });
    }

    const { categories, sources: selectedSources, language } = preference;

    // 3. Build base query using user's categories
    const query = {
      category: {
        $in: categories,
      },

      // Only AI processed news
      "ai.status": "completed",
    };

    // 4. Source logic
    if (selectedSources?.length > 0) {
      // User selected specific sources
      query.source = {
        $in: selectedSources,
      };
    } else {
      // User didn't select any source
      // Get NewsMint's top/default sources
      const topSources = await Source.find({
        isActive: true,
        isVerified: true,
      })
        .sort({ sortOrder: 1 })
        .limit(5)
        .select("_id")
        .lean();

      const topSourceIds = topSources.map((source) => source._id);

      query.source = {
        $in: topSourceIds,
      };
    }

    // 5. Get actual news
    const articles = await NewsArticle.find(query)
      .sort({ newsDate: -1 })
      .limit(20)
      .populate("source", "name shortName logo website")
      .lean();

    // 6. Select AI language
    const summaryKey = language === "Hindi" ? "hindi" : "english";

    // 7. Prepare frontend-friendly response
    const news = articles.map((article) => ({
      id: article._id,
      title: article.title,

      description: article.description,

      summary: article.ai?.summary?.[summaryKey] || "",

      keyPoints: article.ai?.keyPoints?.[summaryKey] || [],

      image: article.image,

      author: article.author,

      url: article.url,

      category: article.category,

      tags: article.tags,

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

    // 8. Response
    return res.status(200).json({
      success: true,

      data: {
        language,
        categories,
        news,
      },
    });
  } catch (error) {
    console.error("getMyNews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user news",
    });
  }
};
