import cron from "node-cron";
import Preference from "../Feature/Prefrence/models/Preference.js";
import NewsArticle from "../NewsArticle/models/NewsArticle.js";
import { formatTelegramDigest } from "./util/telegram.digest.formatter.js";
import { getNextDeliveryAt } from "./util/digestTime.util.js";
import { sendTelegramMessage } from "../TelegramBOT/service/telegram.message.service.js";

export const processDueUsers = async () => {
  const now = new Date();

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const duePreferences = await Preference.find({
    isCompleted: true,
    nextDeliveryAt: {
      $lte: now,
    },
  })
    .select(
      "userId categories sources language deliveryTime timezone telegram nextDeliveryAt",
    )
    .limit(100)
    .lean();

  if (!duePreferences.length) {
    return;
  }

  console.log(`📨 ${duePreferences.length} digest(s) are due`);

  for (const preference of duePreferences) {
    // Telegram not connected
    if (!preference.telegram?.connected || !preference.telegram?.chatId) {
      console.log(`⏭️ Telegram not connected: ${preference.userId}`);
      continue;
    }

    // Build news query
    const newsQuery = {
      category: {
        $in: preference.categories,
      },

      "ai.processed": true,

      // TEMPORARY: allow old news for testing
      newsDate: {
        $gte: since,
        $lte: now,
      },
    };

    // Apply source filter only when user selected sources
    if (preference.sources?.length > 0) {
      newsQuery.source = {
        $in: preference.sources,
      };
    }

    // Get matching news
    const newsArticles = await NewsArticle.find(newsQuery)
      .select(
        "title description category source publishedAt image ai.summary ai.keyPoints url",
      )
      .sort({ newsDate: -1 })
      .limit(20)
      .lean();

    console.log(`📰 News found for ${preference.userId}:`, newsArticles.length);

    if (!newsArticles.length) {
      console.log(`⚠️ No matching news found: ${preference.userId}`);
      continue;
    }

    // Continue with digestNews...

    const digestNews = newsArticles.map((article) => ({
      title: article.title,
      description: article.description,
      category: article.category,
      source: article.source,
      publishedAt: article.publishedAt,
      image: article.image,

      summary:
        preference.language === "Hindi"
          ? article.ai?.summary?.hindi
          : article.ai?.summary?.english,

      keyPoints:
        preference.language === "Hindi"
          ? article.ai?.keyPoints?.hindi
          : article.ai?.keyPoints?.english,

      url: article.url,
    }));

    const telegramMessage = formatTelegramDigest({
      digestNews,
      language: preference.language,
    });

    if (!telegramMessage) {
      console.log(`⚠️ Empty digest: ${preference.userId}`);
      continue;
    }

    // Send Telegram
    await sendTelegramMessage(preference.telegram.chatId, telegramMessage);

    // Calculate next delivery
    const nextDeliveryAt = getNextDeliveryAt(
      preference.deliveryTime,
      preference.timezone,
    );

    // Update next delivery
    await Preference.updateOne(
      { _id: preference._id },
      {
        $set: {
          nextDeliveryAt,
        },
      },
    );
    console.log(`📱 Digest sent successfully: ${preference.userId}`);
  }
};

const startDigestScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await processDueUsers();
    } catch (error) {
      console.error("❌ Digest Scheduler Error:", error.message);
    }
  });

  console.log("📅 Digest scheduler started");
};

export default startDigestScheduler;
