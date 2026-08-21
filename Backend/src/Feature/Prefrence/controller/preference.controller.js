import Preference from "../models/Preference.js";
import User from "../../Auth/models/user.model.js";
import { redisClient } from "../../../config/redis.js";
import { getNextDeliveryAt } from "../../../Scheduler/util/digestTime.util.js";
const ALLOWED_CATEGORIES = [
  "Tech",
  "Rajasthan",
  "India",
  "Markets",
  "Startups",
];

const ALLOWED_LANGUAGES = ["English", "Hindi"];

export const savePreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      categories,
      language,
      deliveryTime,
      phoneNumber,
      telegram,
      timezone = "Asia/Kolkata",
    } = req.body;
    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one category.",
      });
    }

    if (!language || !ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid language.",
      });
    }

    if (!deliveryTime) {
      return res.status(400).json({
        success: false,
        message: "Delivery time is required.",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number is required.",
      });
    }

    // -----------------------------
    // Validate categories
    // -----------------------------

    const invalidCategories = categories.filter(
      (category) => !ALLOWED_CATEGORIES.includes(category),
    );

    if (invalidCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more selected categories are invalid.",
      });
    }

    // -----------------------------
    // Validate phone number
    // -----------------------------

    const cleanPhoneNumber = String(phoneNumber).replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(cleanPhoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian WhatsApp number.",
      });
    }

    const nextDeliveryAt = getNextDeliveryAt(deliveryTime, timezone);

    // -----------------------------
    // Get Telegram data from Redis
    // -----------------------------

    const telegramKey = `telegram:pending:${userId}`;

    const telegramRedisData = await redisClient.get(telegramKey);

    let telegramData = {
      chatId: null,
      telegramUserId: null,
      username: null,
      firstName: null,
      lastName: null,
      connected: false,
    };

    if (telegramRedisData) {
      try {
        const parsedTelegramData = telegramRedisData;

        telegramData = {
          chatId: parsedTelegramData.chatId || null,
          telegramUserId: parsedTelegramData.telegramUserId || null,
          username: parsedTelegramData.username || null,
          firstName: parsedTelegramData.firstName || null,
          lastName: parsedTelegramData.lastName || null,
          connected: true,
        };
      } catch (error) {
        console.error("Invalid Telegram Redis data:", error);
      }
    }

    // -----------------------------
    // Create / Update Preference
    // -----------------------------

    const preference = await Preference.findOneAndUpdate(
      { userId },
      {
        userId,
        categories,
        language,
        deliveryTime,
        phoneNumber: cleanPhoneNumber,
        timezone,

        nextDeliveryAt,

        telegram: {
          chatId: telegram?.chatId || null,
          connected: telegram?.connected || false,
        },

        isCompleted: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    // -----------------------------
    // Delete temporary Telegram data
    // -----------------------------

    if (telegramRedisData) {
      await redisClient.del(telegramKey);
    }

    // -----------------------------
    // Response
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Preferences saved successfully.",
      preference: {
        id: preference._id,
        categories: preference.categories,
        language: preference.language,
        deliveryTime: preference.deliveryTime,
        phoneNumber: preference.phoneNumber,

        telegram: {
          chatId: preference.telegram?.chatId || null,
          connected: preference.telegram?.connected || false,
        },

        isCompleted: preference.isCompleted,
      },
    });
  } catch (error) {
    console.error("Save Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getNextDigestTime = (deliveryTime, timezone) => {
  if (!deliveryTime) {
    return null;
  }

  try {
    const match = deliveryTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (!match) {
      return null;
    }

    let hours = Number(match[1]);
    let minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const now = new Date();

    const nextDigest = new Date(now);

    nextDigest.setHours(hours, minutes, 0, 0);

    // Today's digest has already passed.
    if (nextDigest <= now) {
      nextDigest.setDate(nextDigest.getDate() + 1);
    }

    const difference = nextDigest.getTime() - now.getTime();

    const totalMinutes = Math.floor(difference / (1000 * 60));

    const days = Math.floor(totalMinutes / (60 * 24));

    const remainingMinutes = totalMinutes % (60 * 24);

    const remainingHours = Math.floor(remainingMinutes / 60);

    minutes = remainingMinutes % 60;

    if (days > 0) {
      return `in ${days}d ${remainingHours}h`;
    }

    return `in ${remainingHours}h ${minutes}m`;
  } catch (error) {
    console.error("Next Digest Time Error:", error);
    return null;
  }
};

export const getMyPreferences = async (req, res) => {
  try {
    const [preference, user] = await Promise.all([
      Preference.findOne({
        userId: req.user._id,
      }).lean(),

      User.findById(req.user._id).select("newsStreak lastNewsReadAt").lean(),
    ]);

    // User has never created preferences
    if (!preference) {
      return res.status(200).json({
        success: true,
        hasPreferences: false,
        preference: null,
      });
    }

    const nextDigestTime = getNextDigestTime(
      preference.deliveryTime,
      preference.timezone,
    );

    return res.status(200).json({
      success: true,

      hasPreferences: Boolean(preference.isCompleted),

      preference: {
        id: preference._id,

        // News preferences
        categories: preference.categories,
        sources: preference.sources,

        // Language
        language: preference.language,

        // Delivery
        deliveryTime: preference.deliveryTime,
        timezone: preference.timezone,

        // WhatsApp
        phoneNumber: preference.phoneNumber,

        // Telegram
        telegram: {
          connected: preference.telegram?.connected || false,
        },

        // User activity
        readStreak: user?.newsStreak || 0,

        // Calculated by backend
        nextDigestTime,

        // Setup status
        isCompleted: preference.isCompleted,
      },
    });
  } catch (error) {
    console.error("Get My Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const checkMyPreferences = async (req, res) => {
  try {
    const preference = await Preference.findOne({
      userId: req.user._id,
      isCompleted: true,
    })
      .select("_id")
      .lean();

    return res.status(200).json({
      success: true,
      hasPreferences: Boolean(preference),
    });
  } catch (error) {
    console.error("Check My Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
