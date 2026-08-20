import { TELEGRAM_BOT_TOKEN } from "../../config/env.js";

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let offset = 0;
let isPolling = false;

// Send message to Telegram
const sendTelegramMessage = async (chatId, text) => {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description);
  }
  return data.result;
};

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

      const parts = message.text.trim().split(" ");
      const userId = parts[1] || null;

      console.log("========== TELEGRAM START ==========");

      console.log("NewsMint User ID:", userId);
      console.log("Telegram User ID:", telegramUser.id);
      console.log("Chat ID:", chat.id);
      console.log("Username:", telegramUser.username || null);
      console.log("First Name:", telegramUser.first_name || null);
      console.log("Last Name:", telegramUser.last_name || null);

      console.log("====================================");

      // User opened bot directly without NewsMint
      if (!userId) {
        await sendTelegramMessage(
          chat.id,
          "⚠️ Please connect Telegram from NewsMint.",
        );
        continue;
      }

      // Step 1: Tell user we are connecting
      await sendTelegramMessage(
        chat.id,
        "⏳ Please wait...\n\nConnecting your Telegram account with NewsMint.",
      );

      // Redis connection will be added here
      // await saveTelegramConnection(...);

      // Step 2: Tell user to return to NewsMint
      await sendTelegramMessage(
        chat.id,
        "✅ Telegram Connected!\n\n" +
          "Your Telegram account is connected with NewsMint.\n\n" +
          "👉 Please go back to NewsMint and complete your preferences.",
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
