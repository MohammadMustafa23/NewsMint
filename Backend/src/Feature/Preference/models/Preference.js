import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    categories: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one category is required.",
      },
    },

    sources: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Source",
        },
      ],
      default: [],
      validate: {
        validator: (value) => value.length <= 3,
        message: "You can select a maximum of 3 sources.",
      },
    },
    digestProcessing: {
      type: Boolean,
      default: false,
    },
    digestProcessingAt: {
      type: Date,
      default: null,
    },
    language: {
      type: String,
      enum: ["English", "Hindi"],
      required: true,
    },

    deliveryTime: {
      type: String,
      required: true,
    },
    nextDeliveryAt: {
      type: Date,
      default: null,
      index: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    phoneNumber: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
    telegram: {
      chatId: {
        type: String,
        default: null,
      },

      connected: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Preference = mongoose.model("Preference", preferenceSchema);

export default Preference;
