import axios from "axios";
import { GNEWS_API_KEY } from "../../../config/env.js";
const GNEWS_URL = "https://gnews.io/api/v4/top-headlines";

export const fetchGNews = async () => {
  try {
    const response = await axios.get(GNEWS_URL, {
      params: {
        apikey: GNEWS_API_KEY,
        country: "in",
        lang: "en",
        max: 10,
      },

      timeout: 15000,
    });

    return {
      success: true,
      provider: "GNews",
      total: response.data.articles?.length || 0,
      articles: response.data.articles || [],
    };
  } catch (error) {
    console.error("GNews Error:", error.response?.data || error.message);

    return {
      success: false,
      provider: "GNews",
      message:
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message,
      articles: [],
    };
  }
};
