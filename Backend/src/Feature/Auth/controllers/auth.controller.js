import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateOTP from "../utils/generateOTP.js";
import { redisClient } from "../../../config/redis.js";
import sendOTP from "../utils/sendOTPEmail.js";
import jwt from "jsonwebtoken";
import googleClient from "../utils/googleAuth.js";
import Preference from "../../Preference/models/Preference.js";
import crypto from "crypto";

async function RegisterUser(req, res) {
  const { userName, email, password } = req.body;

  // 1. Check Email Exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists.",
    });
  }

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  //   3. Generate OTP
  const otp = generateOTP();


  // Redis Key
  const cacheKey = `register:${email}`;

  await redisClient.set(
    cacheKey,
    {
      userName,
      email,
      password: hashedPassword,
      otp,
    },
    {
      ex : 300,
    },
  );

  // 5. Send OTP Email
  await sendOTP(email, otp);

  // 6. Success Response
  return res.status(200).json({
    success: true,
    message: "OTP sent successfully.",
  });
}

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      userName: user.userName,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const LogoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

async function GetUserProfile(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
}

async function ForgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const otp = generateOTP();

    await redisClient.set(
      `forget:${email}`,
      {
        email,
        otp,
      },
      {
        ex: 300, // 5 minutes
      },
    );

    await sendOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

async function VerifyResetOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const cacheKey = `forget:${email}`;
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const { otp: storedOTP } = cachedData;

    if (storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await redisClient.del(cacheKey);

    const decoded = {
      email: email,
      purpose: "password-reset",
    };

    const resetToken = jwt.sign(decoded, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });


    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully."
    });
  } catch (error) {
    console.error("VerifyResetOTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

async function ResetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const resetToken = req.cookies.resetToken;
    
    if (!resetToken) {
      return res.status(401).json({
        success: false,
        message: "Password reset session expired. Please try again.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Reset link has expired. Please try again.",
      });
    }

    const user = await User.findOne({
      email: decoded.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.clearCookie("resetToken");
    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please sign in with your new password.",
    });

  } catch (error) {
    console.error("ResetPassword Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Google authorization code is required.",
      });
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);

    if (!tokens?.id_token) {
      return res.status(400).json({
        success: false,
        message: "Failed to retrieve Google ID token.",
      });
    }

    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token.",
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve Google account information.",
      });
    }

    if (!email_verified) {
      return res.status(403).json({
        success: false,
        message: "Google email is not verified.",
      });
    }

    // Find user
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        userName: name,
        email,
        password: hashedPassword,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      userName: user.userName,
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed.",
    });
  }
};

const GetCurrentUser = async (req, res) => {
  try {
    const preference = await Preference.findOne({
      userId: req.user._id,
    }).select("isCompleted");

    return res.status(200).json({
      success: true,
      user: req.user,
      hasPreferences: Boolean(preference?.isCompleted),
    });
    
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  RegisterUser,
  LoginUser,
  GetCurrentUser,
  LogoutUser,
  GetUserProfile,
  ForgotPassword,
  VerifyResetOTP,
  ResetPassword,
  googleLogin,
};
