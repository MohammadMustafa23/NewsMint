import Parser from "rss-parser";
import crypto from "crypto";

import NewsArticle from "../../models/NewsArticle.js";

const parser = new Parser({
  timeout: 15000,
});

const createContentHash = (sourceId, title, url) => {
  const value = `${sourceId}-${title}-${url}`.trim().toLowerCase();

  return crypto.createHash("sha256").update(value).digest("hex");
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

    // TEMPORARY: Inspect the raw RSS article
    console.log("=================================");
    console.log("FIRST RSS ITEM");
    console.dir(feed.items[0], {
      depth: null,
    });
    console.log("=================================");

    let saved = 0;
    let skipped = 0;

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

        const contentHash = createContentHash(source._id, title, url);

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

          category: source.categories?.[0] || "General",

          tags: source.categories || [],

          fetchMethod: "rss",

          fetchedAt: new Date(),

          contentHash,

          newsDate: new Date(),
        });

        saved++;
      } catch (articleError) {
        console.error(`Article Error: ${item.title}`, articleError.message);
      }
    }

    return {
      success: true,
      source: source.name,
      total: feed.items.length,
      saved,
      skipped,
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
