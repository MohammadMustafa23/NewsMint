import { TELEGRAM_BOT_TOKEN,TELEGRAM_BOT_USERNAME } from "../../config/env.js";

export const handleTelegramWebhook = async (req, res) => {
  try {
    console.log("========== TELEGRAM UPDATE ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    return res.sendStatus(200);
  } catch (error) {
    console.error("Telegram Webhook Error:", error);

    return res.sendStatus(200);
  }
};

export const getTelegramConnectUrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const botUsername = TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      return res.status(500).json({
        success: false,
        message: "Telegram bot username is not configured",
      });
    }

    const telegramUrl = `https://t.me/${botUsername}?start=${encodeURIComponent(
      userId.toString(),
    )}`;

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
