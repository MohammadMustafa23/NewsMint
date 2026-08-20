import { TELEGRAM_BOT_TOKEN } from "../../config/env.js";
import { redisClient } from "../../config/redis.js";
import Preference from "../../Feature/Prefrence/models/Preference.js";
import { sendTelegramMessage } from "./telegram.message.service.js";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let offset = 0;
let isPolling = false;
const getUpdates = async () => {
  try {
    const response = await fetch(
      `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`,
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description);
    }

    for (const update of data.result) {
      offset = update.update_id + 1;
      const message = update.message;
      if (!message?.text?.startsWith("/start")) {
        continue;
      }

      const telegramUser = message.from;
      const chat = message.chat;

      // /start TOKEN
      const parts = message.text.trim().split(" ");
      const token = parts[1] || null;

      console.log("========== TELEGRAM START ==========");

      console.log("Telegram User ID:", telegramUser.id);
      console.log("Chat ID:", chat.id);
      console.log("Username:", telegramUser.username || null);
      console.log("First Name:", telegramUser.first_name || null);
      console.log("Last Name:", telegramUser.last_name || null);
      console.log("Connection Token:", token);

      console.log("====================================");

      // ------------------------------------------
      // User opened bot directly
      // ------------------------------------------

      if (!token) {
        await sendTelegramMessage(
          chat.id,
          "⚠️ Please connect Telegram from NewsMint.",
        );
        continue;
      }

      // ------------------------------------------
      // Tell user that connection is processing
      // ------------------------------------------

      await sendTelegramMessage(
        chat.id,
        "⏳ Please wait...\n\nConnecting your Telegram account with NewsMint.",
      );

      // ------------------------------------------
      // 1. Validate secure connection token
      // ------------------------------------------

      const userId = await redisClient.get(`telegram:connect:${token}`);

      if (!userId) {
        await sendTelegramMessage(
          chat.id,
          "❌ This connection link is invalid or expired.\n\nPlease go back to NewsMint and connect Telegram again.",
        );
        continue;
      }

      console.log("NewsMint User ID:", userId);

      // ------------------------------------------
      // 2. Delete connection token immediately
      // ------------------------------------------

      await redisClient.del(`telegram:connect:${token}`);

      // ------------------------------------------
      // 3. Prepare Telegram data
      // ------------------------------------------

      const telegramData = {
        chatId: String(chat.id),
        connected: true,
      };

      // ------------------------------------------
      // 4. Check existing preferences
      // ------------------------------------------

      const preference = await Preference.findOne({
        userId,
      });

      // ------------------------------------------
      // EXISTING USER
      // Save Telegram directly to MongoDB
      // ------------------------------------------

      if (preference) {
        preference.telegram = telegramData;
        await preference.save();
        console.log("✅ Telegram connected directly to MongoDB:", userId);
      }

      // ------------------------------------------
      // NEW USER
      // Preferences don't exist yet
      // Save Telegram temporarily in Redis
      // ------------------------------------------
      else {
        await redisClient.set(
          `telegram:pending:${userId}`,
          JSON.stringify({
            userId,
            ...telegramData,
          }),
          {
            EX: 15 * 60,
          },
        );

        console.log(
          "📦 Telegram data stored in Redis:",
          `telegram:pending:${userId}`,
        );
      }

      // ------------------------------------------
      // 5. Tell user connection is complete
      // ------------------------------------------

      await sendTelegramMessage(
        chat.id,
        "✅ Telegram Connected!\n\n" +
          "Your Telegram account is now connected with NewsMint.\n\n" +
          "👉 Please go back to NewsMint.",
      );
    }
  } catch (error) {
    console.error("Telegram Polling Error:", error.message);
  }
};

const startTelegramPolling = async () => {
  if (isPolling) {
    return;
  }

  isPolling = true;

  console.log("🤖 Telegram polling started");

  while (isPolling) {
    await getUpdates();
  }
};

export default startTelegramPolling;
