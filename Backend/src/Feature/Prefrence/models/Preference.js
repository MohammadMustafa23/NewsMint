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

    language: {
      type: String,
      enum: ["English", "Hindi"],
      required: true,
    },

    deliveryTime: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

const Preference = mongoose.model("Preference", preferenceSchema);

export default Preference;
