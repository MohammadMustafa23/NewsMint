import { TELEGRAM_BOT_TOKEN } from "../../config/env.js";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
export const sendTelegramMessage = async (chatId, text) => {
  if (!chatId) {
    throw new Error("Telegram chat ID is required.");
  }

  if (!text) {
    throw new Error("Telegram message text is required.");
  }

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
    throw new Error(data.description || "Failed to send Telegram message.");
  }

  return data.result;
};
