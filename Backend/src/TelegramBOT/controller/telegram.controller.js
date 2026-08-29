import { TELEGRAM_BOT_USERNAME } from "../../config/env.js";
import crypto from "crypto";
import { redisClient } from "../../config/redis.js";
import Preference from "../../Feature/Preference/models/Preference.js";

const parseCachedObject = (cachedValue) => {
  if (!cachedValue) {
    return null;
  }

  if (typeof cachedValue === "string") {
    try {
      return JSON.parse(cachedValue);
    } catch {
      return null;
    }
  }

  return cachedValue;
};


export const getTelegramStatus = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const preference = await Preference.findOne({
      userId,
      "telegram.connected": true,
      "telegram.chatId": {
        $ne: null,
      },
    })
      .select("telegram")
      .lean();

    if (preference?.telegram?.chatId) {
      return res.status(200).json({
        success: true,
        connected: true,
        telegram: {
          chatId: preference.telegram.chatId,
        },
      });
    }

    const telegramData = parseCachedObject(
      await redisClient.get(`telegram:pending:${userId}`),
    );

    if (!telegramData) {
      return res.status(200).json({
        success: true,
        connected: false,
      });
    }

    const telegram = telegramData;

    return res.status(200).json({
      success: true,
      connected: true,
      telegram: {
        telegramUserId: telegram.telegramUserId,
        chatId: telegram.chatId,
        username: telegram.username,
        firstName: telegram.firstName,
        lastName: telegram.lastName,
      },
    });
  } catch (error) {
    console.error("Telegram Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get Telegram status",
    });
  }
};


export const getTelegramConnectUrl = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Generate secure one-time token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token -> NewsMint user ID
    await redisClient.set(`telegram:connect:${token}`, userId, {
      ex : 10 * 60,
    });

    const botUsername = TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      return res.status(500).json({
        success: false,
        message: "Telegram bot username is not configured",
      });
    }

    const telegramUrl = `https://t.me/${botUsername}?start=${token}`;

    return res.status(200).json({
      success: true,
      telegramUrl,
    });
  } catch (error) {
    console.error("Telegram Connect Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate Telegram connection URL",
    });
  }
};
