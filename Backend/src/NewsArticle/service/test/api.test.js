import dotenv from "dotenv";

import { fetchNewsData } from "../news/newsdata.service.js";
import { fetchGuardianNews } from "../news/guardian.service.js";
import { fetchGNews } from "../news/gnews.service.js";

dotenv.config();

const run = async () => {
  console.log("\n=================================");
  console.log("NEWS API TEST START");
  console.log("=================================\n");

  // -----------------------------
  // NewsData.io
  // -----------------------------

  console.log("Fetching NewsData.io...");

  const newsDataResult = await fetchNewsData();

  console.log({
    provider: newsDataResult.provider,
    success: newsDataResult.success,
    total: newsDataResult.total,
  });

  if (newsDataResult.articles.length > 0) {
    console.log("\nNewsData First Article:");

    console.dir(newsDataResult.articles[0], {
      depth: null,
    });
  }

  // -----------------------------
  // Guardian
  // -----------------------------

  console.log("\nFetching The Guardian...");

  const guardianResult = await fetchGuardianNews();

  console.log({
    provider: guardianResult.provider,
    success: guardianResult.success,
    total: guardianResult.total,
  });

  if (guardianResult.articles.length > 0) {
    console.log("\nGuardian First Article:");

    console.dir(guardianResult.articles[0], {
      depth: null,
    });
  }

  // -----------------------------
  // GNews
  // -----------------------------

  console.log("\nFetching GNews...");

  const gnewsResult = await fetchGNews();

  console.log({
    provider: gnewsResult.provider,
    success: gnewsResult.success,
    total: gnewsResult.total,
  });

  if (gnewsResult.articles.length > 0) {
    console.log("\nGNews First Article:");

    console.dir(gnewsResult.articles[0], {
      depth: null,
    });
  }

  console.log("\n=================================");
  console.log("NEWS API TEST COMPLETE");
  console.log("=================================");
};

run();
