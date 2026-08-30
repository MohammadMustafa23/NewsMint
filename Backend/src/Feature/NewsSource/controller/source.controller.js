import mongoose from "mongoose";

import Source from "../models/source.models.js";
import Preference from "../../Preference/models/Preference.js";
import { redisClient } from "../../../config/redis.js";

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

/*
|--------------------------------------------------------------------------
| GET ALL SOURCES
|--------------------------------------------------------------------------
| Returns the available NewsMint source catalog.
|
| GET /sources
|
*/
export const getAllSources = async (req, res) => {
  try {
    const cacheKey = "sources:all";
    // 1. Check Redis
    const cachedSources = await redisClient.get(cacheKey);

    if (cachedSources) {
      return res.status(200).json({
        success: true,
        ...cachedSources,
      });
    }

    const sources = await Source.find({
      isActive: true,
    })
      .select(
        "name slug shortName description logo website categories region language articlesPerDay isVerified sortOrder",
      )
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

    // 2. Prepare response data
    const responseData = {
      count: sources.length,
      sources,
    };

    // 3. Save in Redis
    await redisClient.set(cacheKey, responseData, {
      ex: 60 * 60, // 1 hour
    });

    return res.status(200).json({
      success: true,
      ...responseData,
      sources,
    });
  } catch (error) {
    console.error("Get All Sources Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
export const getMySources = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `sources:user:${userId}`;

    // 1. Check Redis
    const cachedSources = await redisClient.get(cacheKey);

    if (cachedSources) {
      return res.status(200).json({
        success: true,
        ...cachedSources,
      });
    }

    // 2. Redis MISS → MongoDB
    const preference = await Preference.findOne({
      userId,
    })
      .select("sources")
      .populate({
        path: "sources",
        select:
          "name slug shortName description logo website categories region language articlesPerDay isVerified",
      })
      .lean();

    if (!preference) {
      const responseData = {
        selectedSources: [],
        count: 0,
        limit: 3,
      };

      await redisClient.set(cacheKey, responseData, {
        ex: 30 * 60, // 30 minutes
      });

      return res.status(200).json({
        success: true,
        ...responseData,
      });
    }

    const responseData = {
      selectedSources: preference.sources || [],
      count: preference.sources?.length || 0,
      limit: 3,
    };

    // 3. Save in Redis
    await redisClient.set(cacheKey, responseData, {
      ex: 30 * 60, // 30 minutes
    });

    return res.status(200).json({
      success: true,
      ...responseData,
      cached: false,
    });
  } catch (error) {
    console.error("Get My Sources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateMySources = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sources } = req.body;

    // -----------------------------
    // Validate array
    // -----------------------------

    if (!Array.isArray(sources)) {
      return res.status(400).json({
        success: false,
        message: "Sources must be an array.",
      });
    }

    // -----------------------------
    // Maximum 3 sources
    // -----------------------------

    if (sources.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You can select a maximum of 3 sources.",
      });
    }

    // -----------------------------
    // Remove duplicate IDs
    // -----------------------------

    const uniqueSources = [...new Set(sources.map(String))];

    if (uniqueSources.length !== sources.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate sources are not allowed.",
      });
    }

    // -----------------------------
    // Validate ObjectIds
    // -----------------------------

    const invalidIds = uniqueSources.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more source IDs are invalid.",
      });
    }

    // -----------------------------
    // Check sources exist + active
    // -----------------------------

    const validSources = await Source.find({
      _id: { $in: uniqueSources },
      isActive: true,
    })
      .select("_id")
      .lean();

    if (validSources.length !== uniqueSources.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected sources are unavailable.",
      });
    }

    // -----------------------------
    // Get user preference
    // -----------------------------

    const preference = await Preference.findOne({
      userId,
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "User preferences not found.",
      });
    }

    // -----------------------------
    // Save source IDs
    // -----------------------------

    preference.sources = uniqueSources.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    await preference.save();

    // -----------------------------
    // Invalidate caches
    // -----------------------------

    await Promise.all([
      redisClient.del(`sources:user:${userId}`),
      redisClient.del(`news:user:${userId}`),
      redisClient.del(`preference:user:${userId}`),
    ]);

    // -----------------------------
    // Response
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Sources updated successfully.",
      sources: preference.sources,
      count: preference.sources.length,
      limit: 3,
    });
  } catch (error) {
    console.error("Update My Sources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const removeSource = async (req, res) => {
  try {
    const { sourceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid source ID.",
      });
    }

    const preference = await Preference.findOne({
      userId: req.user._id,
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "User preferences not found.",
      });
    }

    const sourceExists = preference.sources.some(
      (id) => id.toString() === sourceId,
    );

    if (!sourceExists) {
      return res.status(404).json({
        success: false,
        message: "Source is not selected.",
      });
    }

    preference.sources = preference.sources.filter(
      (id) => id.toString() !== sourceId,
    );

    await preference.save();

    // Invalidate related caches
    await redisClient.del(`sources:user:${req.user._id}`);
    await redisClient.del(`news:user:${req.user._id}`);
    await redisClient.del(`preference:user:${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: "Source removed successfully.",
      removedSourceId: sourceId,
      count: preference.sources.length,
      limit: 3,
    });
  } catch (error) {
    console.error("Remove Source Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
