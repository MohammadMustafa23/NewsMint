import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`,
    );

    console.dir(response.data, {
      depth: null,
    });
  } catch (error) {
  }
};

run();
