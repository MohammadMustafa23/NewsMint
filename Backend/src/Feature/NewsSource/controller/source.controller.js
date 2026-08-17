import mongoose from "mongoose";

import Source from "../models/source.models.js";
import Preference from "../../Prefrence/models/Preference.js";

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

    return res.status(200).json({
      success: true,
      count: sources.length,
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


/*
|--------------------------------------------------------------------------
| GET MY SELECTED SOURCES
|--------------------------------------------------------------------------
| Returns the sources selected by the logged-in user.
|
| GET /sources/me
|
*/
export const getMySources = async (req, res) => {
  try {
    const preference = await Preference.findOne({
      userId: req.user._id,
    })
      .select("sources")
      .populate({
        path: "sources",
        select:
          "name slug shortName description logo website categories region language articlesPerDay isVerified",
      })
      .lean();

    if (!preference) {
      return res.status(200).json({
        success: true,
        selectedSources: [],
        count: 0,
        limit: 3,
      });
    }

    return res.status(200).json({
      success: true,
      selectedSources: preference.sources || [],
      count: preference.sources?.length || 0,
      limit: 3,
    });
  } catch (error) {
    console.error("Get My Sources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADD SOURCE
|--------------------------------------------------------------------------
| Adds a source to the logged-in user's preferences.
|
| POST /sources/select
|
| Body:
| {
|   "sourceId": "SOURCE_ID"
| }
|
*/
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


/*
|--------------------------------------------------------------------------
| REMOVE SOURCE
|--------------------------------------------------------------------------
| Removes a selected source from the user's preferences.
|
| DELETE /sources/select/:sourceId
|
*/
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