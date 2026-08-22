import mongoose from "mongoose";
import { ALLOWED_CATEGORIES } from "../../../NewsArticle/service/contents/news.constants.js";

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    // Main classification used by the Sources page
    categories: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (value) => value.length > 0,
          message: "At least one category is required.",
        },
        {
          validator: (value) =>
            value.every((category) => ALLOWED_CATEGORIES.includes(category)),
          message: "Source contains an invalid NewsMint category.",
        },
      ],
    },

    // India / Global
    region: {
      type: String,
      enum: ["India", "Global"],
      required: true,
    },

    // Main language of the source
    language: {
      type: String,
      enum: ["English", "Hindi"],
      default: "English",
    },

    // How NewsMint will fetch news from this source
    fetchMethod: {
      type: String,
      enum: ["api", "rss", "scrape"],
      required: true,
    },

    // External provider/source identifier
    provider: {
      type: String,
      default: "",
      trim: true,
    },

    // API identifier if provider requires one
    apiIdentifier: {
      type: String,
      default: "",
      trim: true,
    },

    // RSS feed URL if this source uses RSS
    rssUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Approximate number displayed in UI
    articlesPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Whether NewsMint currently supports fetching this source
    isActive: {
      type: Boolean,
      default: true,
    },

    // Trusted/verified by NewsMint
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Controls ordering on the Sources page
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Source = mongoose.model("Source", sourceSchema);

export default Source;
