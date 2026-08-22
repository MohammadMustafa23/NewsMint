import axios from "axios";
import { GUARDIAN_API_KEY } from "../../../config/env.js";
const API_KEY = GUARDIAN_API_KEY;

const URL = "https://content.guardianapis.com/search";

const testGuardian = async () => {
  try {
    console.log("🔑 API Key exists:", Boolean(API_KEY));
    console.log("📡 Testing Guardian API...");

    const response = await axios.get(URL, {
      params: {
        "api-key": API_KEY,
        q: "technology software gadgets",
        "page-size": 5,
        "order-by": "newest",
      },
      timeout: 15000,
    });

    console.log("✅ Guardian API SUCCESS");

    console.log("Results:", response.data?.response?.results?.length);
  } catch (error) {
    console.log("❌ Guardian API FAILED");

    console.log("Status:", error.response?.status);

    console.log("Response:", error.response?.data);
  }
};

testGuardian();
