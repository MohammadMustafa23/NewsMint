import axios from "axios";
import { GUARDIAN_API_KEY } from "../../../config/env.js";
const GUARDIAN_URL = "https://content.guardianapis.com/search";

export const fetchGuardianNews = async () => {
  try {
    const response = await axios.get(GUARDIAN_URL, {
      params: {
        "api-key": GUARDIAN_API_KEY,

        "page-size": 20,

        "order-by": "newest",

        "show-fields": "trailText,thumbnail,byline",

        "show-tags": "keyword",
      },

      timeout: 15000,
    });

    const results = response.data.response?.results || [];

    return {
      success: true,
      provider: "The Guardian",
      total: results.length,
      articles: results,
    };
  } catch (error) {
    console.error("Guardian Error:", error.response?.data || error.message);

    return {
      success: false,
      provider: "The Guardian",
      message: error.response?.data?.message || error.message,
      articles: [],
    };
  }
};
