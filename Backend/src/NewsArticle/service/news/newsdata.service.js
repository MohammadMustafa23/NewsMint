import axios from "axios";
import { NEWSDATA_API_KEY } from "../../../config/env.js";
const NEWSDATA_URL = "https://newsdata.io/api/1/latest";

export const fetchNewsData = async () => {
  try {
    const response = await axios.get(NEWSDATA_URL, {
      params: {
        apikey: NEWSDATA_API_KEY,
        country: "in",
        language: "en",
      },
      timeout: 15000,
    });

    return {
      success: true,
      provider: "NewsData.io",
      total: response.data.results?.length || 0,
      articles: response.data.results || [],
    };
  } catch (error) {
    console.error("NewsData Error:", error.response?.data || error.message);

    return {
      success: false,
      provider: "NewsData.io",
      message: error.response?.data?.message || error.message,
      articles: [],
    };
  }
};
