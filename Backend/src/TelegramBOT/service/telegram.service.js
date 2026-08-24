import { TELEGRAM_BOT_TOKEN } from "../../config/env.js";
import { redisClient } from "../../config/redis.js";
import Preference from "../../Feature/Prefrence/models/Preference.js";
import { sendTelegramMessage } from "./telegram.message.service.js";

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let offset = 0;
let isPolling = false;

const TELEGRAM_COMMANDS = [
  {
    command: "start",
    description: "📰 Start using NewsMint",
  },
  {
    command: "about",
    description: "ℹ️ Learn about NewsMint",
  },
  {
    command: "checkconnection",
    description: "🔗 Check your connection",
  },
  {
    command: "yourfeed",
    description: "📰 View your NewsMint feed",
  },
];

const setTelegramCommands = async () => {
  try {
    const response = await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commands: TELEGRAM_COMMANDS,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        data.description || "Failed to register Telegram commands",
      );
    }

    console.log("✅ Telegram bot commands registered");
  } catch (error) {
    console.error("❌ Telegram command setup failed:", error.message);
  }
};

const sendWelcomeMessage = async (chatId) => {
  await sendTelegramMessage(
    chatId,
    `📰 NEWSMINT

Your daily news, simplified.

Welcome to NewsMint 👋

Get the most important news from India
and around the world — summarized and
delivered directly to Telegram.

━━━━━━━━━━━━━━━━━━

✨ AI-powered summaries
📰 Curated news
🌐 English & Hinglish
⏰ Automatic delivery

━━━━━━━━━━━━━━━━━━

Connect your Telegram account through
the NewsMint web app to start receiving
your personalized news brief.`,
  );
};

const sendConnectionProcessingMessage = async (chatId) => {
  await sendTelegramMessage(
    chatId,
    `📰 NEWSMINT

⏳ Connecting your Telegram account...

Please wait a moment.`,
  );
};

const sendInvalidConnectionMessage = async (chatId) => {
  await sendTelegramMessage(
    chatId,
    `📰 NEWSMINT

❌ CONNECTION FAILED

This connection link is invalid or has
expired.

━━━━━━━━━━━━━━━━━━

Please return to NewsMint and generate
a new Telegram connection link.

Your previous link cannot be reused.`,
  );
};

const sendConnectionSuccessMessage = async (chatId) => {
  await sendTelegramMessage(
    chatId,
    `📰 NEWSMINT

✅ TELEGRAM CONNECTED

You're all set! 🎉

Your Telegram account is now connected
with NewsMint.

━━━━━━━━━━━━━━━━━━

YOUR NEWS EXPERIENCE

📰 Curated daily news
🤖 AI-powered summaries
🌐 English & Hinglish
⏰ Automatic delivery

━━━━━━━━━━━━━━━━━━

You don't need to request your news.

NewsMint will automatically deliver your
personalized news brief here at your
scheduled time.

━━━━━━━━━━━━━━━━━━

✨ Stay informed.
✨ Stay ahead.

📰 NewsMint`,
  );
};

const handleStart = async (message) => {
  const chatId = message.chat.id;
  const text = message.text?.trim() || "";

  const parts = text.split(/\s+/);
  const token = parts[1] || null;

  if (!token) {
    await sendWelcomeMessage(chatId);
    return;
  }

  await sendConnectionProcessingMessage(chatId);

  const userId = await redisClient.get(`telegram:connect:${token}`);

  if (!userId) {
    await sendInvalidConnectionMessage(chatId);
    return;
  }

  console.log("🔗 Telegram connection request:", {
    telegramUserId: message.from?.id,
    chatId,
    userId,
  });

  await redisClient.del(`telegram:connect:${token}`);

  const telegramData = {
    chatId: String(chatId),
    connected: true,
  };

  const preference = await Preference.findOne({
    userId,
  });

  if (preference) {
    preference.telegram = telegramData;

    await preference.save();

    console.log("✅ Telegram connection saved:", userId);

    await sendConnectionSuccessMessage(chatId);

    return;
  }

  await redisClient.set(
    `telegram:pending:${userId}`,
    JSON.stringify({
      userId,
      ...telegramData,
    }),
    {
      ex : 15 * 60,
    },
  );

  console.log("📦 Telegram connection stored temporarily:", userId);

  await sendConnectionSuccessMessage(chatId);
};

const handleAbout = async (message) => {
  await sendTelegramMessage(
    message.chat.id,
    `📰 NEWSMINT

Your personal daily news brief.

NewsMint helps you stay informed without
spending hours reading through multiple
news sources.

━━━━━━━━━━━━━━━━━━

✨ WHAT WE DO

📰 Curate important news
🤖 Generate AI-powered summaries
🌐 Support English & Hinglish
⏰ Deliver personalized updates
📱 Bring everything directly to Telegram

━━━━━━━━━━━━━━━━━━

NewsMint is designed to give you the
important information you need — without
the noise.

Stay informed. Stay ahead.

📰 NewsMint`,
  );
};

const handleCheckConnection = async (message) => {
  const chatId = String(message.chat.id);

  const preference = await Preference.findOne({
    "telegram.chatId": chatId,
    "telegram.connected": true,
  }).lean();

  if (!preference) {
    await sendTelegramMessage(
      message.chat.id,
      `📰 NEWSMINT

🔗 CONNECTION STATUS

❌ Not Connected

Your Telegram account is not currently
connected with NewsMint.

Please connect Telegram through the
NewsMint web app.`,
    );

    return;
  }

  await sendTelegramMessage(
    message.chat.id,
    `📰 NEWSMINT

🔗 CONNECTION STATUS

✅ Connected

Your Telegram account is successfully
connected with NewsMint.

Your personalized news updates will be
delivered automatically according to your
selected schedule.

━━━━━━━━━━━━━━━━━━

🟢 Connection Active`,
  );
};

const handleYourFeed = async (message) => {
  const chatId = String(message.chat.id);

  const preference = await Preference.findOne({
    "telegram.chatId": chatId,
    "telegram.connected": true,
  }).lean();

  if (!preference) {
    await sendTelegramMessage(
      message.chat.id,
      `📰 NEWSMINT

📰 YOUR NEWS FEED

❌ Telegram is not connected.

Please connect your Telegram account
through the NewsMint web app first.`,
    );

    return;
  }

  const categories = preference.categories?.length
    ? preference.categories
    : ["General"];

  const language = preference.language || "Not set";

  const deliveryTime = preference.deliveryTime || "Not set";

  const categoryList = categories.map((category) => `• ${category}`).join("\n");

  await sendTelegramMessage(
    message.chat.id,
    `📰 NEWSMINT

📰 YOUR NEWS FEED

Your current NewsMint feed:

━━━━━━━━━━━━━━━━━━

📚 CATEGORIES

${categoryList}

━━━━━━━━━━━━━━━━━━

🌐 LANGUAGE

${language}

━━━━━━━━━━━━━━━━━━

⏰ DELIVERY

${deliveryTime}

━━━━━━━━━━━━━━━━━━

Your preferences are managed through
the NewsMint web app.

📰 NewsMint`,
  );
};

const handleTelegramCommand = async (message) => {
  const text = message.text?.trim();

  if (!text) {
    return;
  }

  const command = text.split(/\s+/)[0].toLowerCase().split("@")[0];

  switch (command) {
    case "/start":
      await handleStart(message);
      break;

    case "/about":
      await handleAbout(message);
      break;

    case "/checkconnection":
      await handleCheckConnection(message);
      break;

    case "/yourfeed":
      await handleYourFeed(message);
      break;

    default:
      break;
  }
};

const getUpdates = async () => {
  try {
    const response = await fetch(
      `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`,
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || "Telegram API error");
    }

    for (const update of data.result) {
      offset = update.update_id + 1;

      const message = update.message;

      if (!message?.text) {
        continue;
      }

      try {
        await handleTelegramCommand(message);
      } catch (error) {
        console.error("❌ Telegram command failed:", error.message);
      }
    }
  } catch (error) {
    console.error("❌ Telegram polling error:", error.message);
  }
};

const startTelegramPolling = async () => {
  if (isPolling) {
    return;
  }

  isPolling = true;

  await setTelegramCommands();

  console.log("🤖 Telegram polling started");

  while (isPolling) {
    await getUpdates();
  }
};

export default startTelegramPolling;
