import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    cloudStorage: {
      used: {
        type: Number,
        default: 0,
      },

      limit: {
        type: Number,
        default: 500 * 1024 * 1024, // 500 MB
      },
    },

    downloadLimit: {
      max: {
        type: Number,
        default: 3, // Free users can download 3 videos
      },

      used: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
