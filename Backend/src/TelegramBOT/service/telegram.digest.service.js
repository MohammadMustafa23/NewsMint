import { sendTelegramMessage } from "./telegram.message.service.js";

export const sendTelegramDigest = async ({ chatId, digest }) => {
  if (!chatId) {
    throw new Error("Telegram chat ID is required.");
  }

  if (!digest) {
    throw new Error("Telegram digest is required.");
  }

  return await sendTelegramMessage(chatId, digest);
};
