import cron from "node-cron";
import Preference from "../Feature/Preference/models/Preference.js";
import NewsArticle from "../NewsArticle/models/NewsArticle.js";
import { formatTelegramDigest } from "./util/telegram.digest.formatter.js";
import { getNextDeliveryAt } from "./util/digestTime.util.js";
import { sendTelegramMessage } from "../TelegramBOT/service/telegram.message.service.js";
import { splitTelegramMessage } from "./util/telegram.message.splitter.js";

const CLAIM_TIMEOUT = 10 * 60 * 1000;
const BATCH_SIZE = 100;

export const processDueUsers = async () => {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // -----------------------------------------
  // Recover stale processing claims
  // -----------------------------------------

  const staleClaimTime = new Date(now.getTime() - CLAIM_TIMEOUT);

  await Preference.updateMany(
    {
      digestProcessing: true,
      digestProcessingAt: {
        $lte: staleClaimTime,
      },
    },
    {
      $set: {
        digestProcessing: false,
        digestProcessingAt: null,
      },
    },
  );

  // -----------------------------------------
  // Find due preferences
  // -----------------------------------------

  const duePreferences = await Preference.find({
    isCompleted: true,

    nextDeliveryAt: {
      $lte: now,
    },

    digestProcessing: false,
  })
    .select(
      "userId categories sources language deliveryTime timezone telegram nextDeliveryAt",
    )
    .sort({
      nextDeliveryAt: 1,
      _id: 1,
    })
    .limit(BATCH_SIZE)
    .lean();

  if (!duePreferences.length) {
    return;
  }

  console.log(`📨 ${duePreferences.length} digest(s) are due`);

  // -----------------------------------------
  // Process users
  // -----------------------------------------

  for (const preference of duePreferences) {
    try {
      // -----------------------------------------
      // Atomically claim this digest
      // -----------------------------------------

      const claim = await Preference.findOneAndUpdate(
        {
          _id: preference._id,
          isCompleted: true,
          nextDeliveryAt: {
            $lte: now,
          },
          digestProcessing: false,
        },
        {
          $set: {
            digestProcessing: true,
            digestProcessingAt: new Date(),
          },
        },
        {
          new: true,
        },
      ).lean();

      // Another scheduler already claimed it
      if (!claim) {
        console.log(`⏭️ Digest already claimed: ${preference.userId}`);

        continue;
      }

      // -----------------------------------------
      // Telegram not connected
      // -----------------------------------------

      if (!claim.telegram?.connected || !claim.telegram?.chatId) {
        console.log(`⏭️ Telegram not connected: ${claim.userId}`);

        const nextDeliveryAt = getNextDeliveryAt(
          claim.deliveryTime,
          claim.timezone,
        );

        await Preference.updateOne(
          {
            _id: claim._id,
            digestProcessing: true,
          },
          {
            $set: {
              nextDeliveryAt,
              digestProcessing: false,
              digestProcessingAt: null,
            },
          },
        );

        continue;
      }

      // -----------------------------------------
      // Build news query
      // -----------------------------------------

      const newsQuery = {
        category: {
          $in: claim.categories,
        },

        "ai.processed": true,

        newsDate: {
          $gte: since,
          $lte: now,
        },
      };

      // Apply source filter
      if (claim.sources?.length > 0) {
        newsQuery.source = {
          $in: claim.sources,
        };
      }

      // -----------------------------------------
      // Get matching news
      // -----------------------------------------

      const newsArticles = await NewsArticle.find(newsQuery)
        .select(
          "title description category source publishedAt image ai.summary ai.keyPoints url",
        )
        .sort({
          newsDate: -1,
          _id: -1,
        })
        .limit(20)
        .lean();

      console.log(`📰 News found for ${claim.userId}: ${newsArticles.length}`);

      // -----------------------------------------
      // No news
      // -----------------------------------------

      if (!newsArticles.length) {
        console.log(`⚠️ No matching news found: ${claim.userId}`);

        const nextDeliveryAt = getNextDeliveryAt(
          claim.deliveryTime,
          claim.timezone,
        );

        await Preference.updateOne(
          {
            _id: claim._id,
            digestProcessing: true,
          },
          {
            $set: {
              nextDeliveryAt,
              digestProcessing: false,
              digestProcessingAt: null,
            },
          },
        );

        continue;
      }

      // -----------------------------------------
      // Build digest news
      // -----------------------------------------

      const digestNews = newsArticles.map((article) => ({
        title: article.title,
        description: article.description,
        category: article.category,
        source: article.source,
        publishedAt: article.publishedAt,
        image: article.image,

        summary:
          claim.language === "Hindi"
            ? article.ai?.summary?.hindi
            : article.ai?.summary?.english,

        keyPoints:
          claim.language === "Hindi"
            ? article.ai?.keyPoints?.hindi
            : article.ai?.keyPoints?.english,

        url: article.url,
      }));

      // -----------------------------------------
      // Format digest
      // -----------------------------------------

      const telegramMessage = formatTelegramDigest({
        digestNews,
        language: claim.language,
      });

      if (!telegramMessage) {
        console.log(`⚠️ Empty digest: ${claim.userId}`);

        const nextDeliveryAt = getNextDeliveryAt(
          claim.deliveryTime,
          claim.timezone,
        );

        await Preference.updateOne(
          {
            _id: claim._id,
            digestProcessing: true,
          },
          {
            $set: {
              nextDeliveryAt,
              digestProcessing: false,
              digestProcessingAt: null,
            },
          },
        );

        continue;
      }

      // -----------------------------------------
      // Split Telegram message
      // -----------------------------------------

      const messageChunks = splitTelegramMessage(telegramMessage);

      console.log(`📨 Digest split into ${messageChunks.length} message(s)`);

      // -----------------------------------------
      // Send Telegram chunks
      // -----------------------------------------

      let sentChunks = 0;

      try {
        for (let i = 0; i < messageChunks.length; i++) {
          await sendTelegramMessage(claim.telegram.chatId, messageChunks[i]);

          sentChunks++;

          console.log(`📤 Message ${i + 1}/${messageChunks.length} sent`);
        }
      } catch (telegramError) {
        console.error(
          `❌ Telegram delivery failed for ${claim.userId}`,
          telegramError,
        );

        /*
         * Important:
         * Some chunks may already have been delivered.
         *
         * We do NOT immediately send the whole digest again
         * on the next minute.
         *
         * Move the user to the next delivery window.
         */

        const nextDeliveryAt = getNextDeliveryAt(
          claim.deliveryTime,
          claim.timezone,
        );

        await Preference.updateOne(
          {
            _id: claim._id,
            digestProcessing: true,
          },
          {
            $set: {
              nextDeliveryAt,
              digestProcessing: false,
              digestProcessingAt: null,
            },
          },
        );

        console.error(
          `⚠️ Partial Telegram delivery: ${sentChunks}/${messageChunks.length}`,
        );

        continue;
      }

      // -----------------------------------------
      // Calculate next delivery
      // -----------------------------------------

      const nextDeliveryAt = getNextDeliveryAt(
        claim.deliveryTime,
        claim.timezone,
      );

      // -----------------------------------------
      // Mark successful delivery
      // -----------------------------------------

      await Preference.updateOne(
        {
          _id: claim._id,
          digestProcessing: true,
        },
        {
          $set: {
            nextDeliveryAt,
            digestProcessing: false,
            digestProcessingAt: null,
          },
        },
      );

      console.log(`📱 Digest sent successfully: ${claim.userId}`);
    } catch (error) {
      console.error(`❌ Digest processing failed: ${preference.userId}`, error);

      /*
       * Always release the processing claim.
       *
       * Schedule the next delivery so a permanent error
       * doesn't cause the same user to execute every minute.
       */

      try {
        const nextDeliveryAt = getNextDeliveryAt(
          preference.deliveryTime,
          preference.timezone,
        );

        await Preference.updateOne(
          {
            _id: preference._id,
            digestProcessing: true,
          },
          {
            $set: {
              nextDeliveryAt,
              digestProcessing: false,
              digestProcessingAt: null,
            },
          },
        );
      } catch (cleanupError) {
        console.error("❌ Failed to release digest claim:", cleanupError);
      }
    }
  }
};

// -----------------------------------------
// Digest Scheduler
// -----------------------------------------

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
