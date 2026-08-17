import mongoose from "mongoose";

const newsArticleSchema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    author: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    category: {
      type: String,
      default: "General",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    // RSS/API
    fetchMethod: {
      type: String,
      enum: ["rss", "api"],
      required: true,
    },

    fetchedAt: {
      type: Date,
      default: Date.now,
    },

    // Used to identify duplicate articles
    contentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Which daily batch this article belongs to
    newsDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Later we'll use these
    ai: {
      processed: {
        type: Boolean,
        default: false,
      },

      summary: {
        english: {
          type: String,
          default: "",
        },

        hindi: {
          type: String,
          default: "",
        },
      },

      keyPoints: {
        english: {
          type: [String],
          default: [],
        },

        hindi: {
          type: [String],
          default: [],
        },
      },

      importanceScore: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);

export default NewsArticle;
