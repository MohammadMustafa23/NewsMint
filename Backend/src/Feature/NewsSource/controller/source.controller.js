import mongoose from "mongoose";

import Source from "../models/source.models.js";
import Preference from "../../Prefrence/models/Preference.js";
import { redisClient } from "../../../config/redis.js";

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
        cached: true,
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
    await redisClient.set(cacheKey,responseData, {
      ex : 60 * 60, // 1 hour
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
        cached: true,
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

      await redisClient.set(cacheKey, JSON.stringify(responseData), {
        ex : 30 * 60, // 30 minutes
      });

      return res.status(200).json({
        success: true,
        ...responseData,
        cached: false,
      });
    }

    const responseData = {
      selectedSources: preference.sources || [],
      count: preference.sources?.length || 0,
      limit: 3,
    };

    // 3. Save in Redis
    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      ex : 30 * 60, // 30 minutes
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

export const addSource = async (req, res) => {
  try {
    const { sourceId } = req.body;

    if (!sourceId) {
      return res.status(400).json({
        success: false,
        message: "Source ID is required.",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid source ID.",
      });
    }

    // Check source exists and is active
    const source = await Source.findOne({
      _id: sourceId,
      isActive: true,
    }).lean();

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found.",
      });
    }

    // Get user's preferences
    const preference = await Preference.findOne({
      userId: req.user._id,
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "User preferences not found.",
      });
    }

    // Check duplicate
    const alreadySelected = preference.sources.some(
      (id) => id.toString() === sourceId,
    );

    if (alreadySelected) {
      return res.status(409).json({
        success: false,
        message: "Source is already selected.",
      });
    }

    // Maximum 3 sources
    if (preference.sources.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "You can select a maximum of 3 sources.",
      });
    }

    preference.sources.push(source._id);

    await preference.save();

    // Invalidate related caches
    await redisClient.del(`sources:user:${req.user._id}`);
    await redisClient.del(`news:user:${req.user._id}`);
    await redisClient.del(`preference:user:${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: `${source.name} added successfully.`,
      source: {
        _id: source._id,
        name: source.name,
        shortName: source.shortName,
      },
      count: preference.sources.length,
      limit: 3,
    });
  } catch (error) {
    console.error("Add Source Error:", error);

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
