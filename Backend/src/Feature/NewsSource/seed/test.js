import axios from "axios";
import { GUARDIAN_API_KEY } from "../../../config/env.js";
const API_KEY = GUARDIAN_API_KEY;

const URL = "https://content.guardianapis.com/search";

const testGuardian = async () => {
  try {
    const response = await axios.get(URL, {
      params: {
        "api-key": API_KEY,
        q: "technology software gadgets",
        "page-size": 5,
        "order-by": "newest",
      },
      timeout: 15000,
    });
  } catch (error) {
    console.error("Response:", error.response?.data);
  }
};

testGuardian();
