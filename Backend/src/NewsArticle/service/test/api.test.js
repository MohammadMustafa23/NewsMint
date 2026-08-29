import mongoose from "mongoose";
import dotenv from "dotenv";

import Source from "../../../Feature/NewsSource/models/source.models.js";
import { MONGO_URI } from '../../../config/env.js'

import { fetchNewsData } from "../news/newsdata.service.js";
import { fetchGuardianNews } from "../news/guardian.service.js";
import { fetchGNews } from "../news/gnews.service.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // =================================
    // NewsData.io
    // =================================

    const newsDataSource = await Source.findOne({
      name: "NewsData.io",
      fetchMethod: "api",
      isActive: true,
    });

    if (!newsDataSource) {
      throw new Error("NewsData.io source not found");
    }


    const newsDataResult = await fetchNewsData(newsDataSource);
    // =================================
    // Guardian
    // =================================

    const guardianSource = await Source.findOne({
      name: "The Guardian",
      fetchMethod: "api",
      isActive: true,
    });

    if (!guardianSource) {
      throw new Error("The Guardian source not found");
    }

    console.log("\nFetching The Guardian...");

    const guardianResult = await fetchGuardianNews(guardianSource);

    console.log("Guardian Result:");
    console.log(guardianResult);

    // =================================
    // GNews
    // =================================

    const gnewsSource = await Source.findOne({
      name: "GNews",
      fetchMethod: "api",
      isActive: true,
    });

    if (!gnewsSource) {
      throw new Error("GNews source not found");
    }

    console.log("\nFetching GNews...");

    const gnewsResult = await fetchGNews(gnewsSource);

    // =================================
    // FINAL SUMMARY
    // =================================
    console.table([
      {
        provider: "NewsData.io",
        success: newsDataResult.success,
        total: newsDataResult.total,
        saved: newsDataResult.saved,
        skipped: newsDataResult.skipped,
      },
      {
        provider: "The Guardian",
        success: guardianResult.success,
        total: guardianResult.total,
        saved: guardianResult.saved,
        skipped: guardianResult.skipped,
      },
      {
        provider: "GNews",
        success: gnewsResult.success,
        total: gnewsResult.total,
        saved: gnewsResult.saved,
        skipped: gnewsResult.skipped,
      },
    ]);
  } catch (error) {
    console.error("\nNEWS API TEST ERROR:", error.message);
  } finally {
    await mongoose.disconnect();

    console.log("\nMongoDB disconnected");
    console.log("NEWS API INGESTION TEST END");
  }
};

run();
