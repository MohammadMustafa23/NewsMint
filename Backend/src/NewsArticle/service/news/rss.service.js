import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
});

const NEWS_LOOKBACK_HOURS = 24;

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

export const fetchRSSSource = async (category, source) => {
  try {
    // ==========================================
    // 1. VALIDATION
    // ==========================================

    if (!category) {
      throw new Error("Category is required");
    }

    if (!source?._id) {
      throw new Error("RSS Source document is required");
    }

    if (!source.rssUrl) {
      throw new Error(`RSS URL not configured for ${source.name}`);
    }

  
    // ==========================================
    // 2. FETCH RSS
    // ==========================================

    const feed = await parser.parseURL(source.rssUrl);

    const now = new Date();

    const since = new Date(
      now.getTime() - NEWS_LOOKBACK_HOURS * 60 * 60 * 1000,
    );

    // ==========================================
    // 3. SORT BY PUBLICATION DATE
    // ==========================================

    const sortedItems = [...feed.items].sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    // ==========================================
    // 4. NORMALIZE
    // ==========================================

    const articles = sortedItems
      .map((item) => {
        if (!item.title || !item.link) {
          return null;
        }

        const title = cleanText(item.title);

        const description = cleanText(
          item.contentSnippet || item.content || item.description || "",
        );

        const url = item.link.trim();

        if (!title || !url) {
          return null;
        }

        const publishedAt = item.pubDate ? new Date(item.pubDate) : null;

        /*
         * RSS article must have a valid
         * publication date.
         */
        if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
          return null;
        }

        /*
         * Only keep recent articles.
         */
        if (publishedAt < since) {
          return null;
        }

        /*
         * Reject future-dated articles.
         */
        if (publishedAt > now) {
          return null;
        }

        const author = item.creator || item.author || "";

        return {
          source: source._id,

          sourceKey: source.slug,

          title,

          description,

          url,

          image: extractImage(item),

          author: cleanText(author),

          publishedAt,

          category,

          tags: [],

          fetchMethod: "rss",
        };
      })
      .filter(Boolean);
    
    return articles;
  } catch (error) {
    console.error(
      `❌ RSS ${source?.name || "RSS"} → ${category}:`,
      error.message,
    );

    return [];
  }
};
