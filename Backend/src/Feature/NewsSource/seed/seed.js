import mongoose from "mongoose";
import Source from "../models/source.models.js";
import dotenv from "dotenv";

dotenv.config();

const sources = [
  {
    name: "NDTV",
    slug: "ndtv",
    shortName: "NDTV",
    description:
      "NDTV provides national and international news, business, technology, sports and entertainment coverage.",
    logo: "",
    website: "https://www.ndtv.com",
    categories: [
      "India",
      "World",
      "Business",
      "Technology",
      "Sports",
      "Entertainment",
    ],
    region: "India",
    language: "English",
    fetchMethod: "rss",
    provider: "NDTV",
    apiIdentifier: "",
    rssUrl: "https://feeds.feedburner.com/ndtvnews-top-stories",
    articlesPerDay: 0,
    isActive: true,
    isVerified: true,
    sortOrder: 1,
  },
  {
    name: "Hindustan Times",
    slug: "hindustan-times",
    shortName: "HT",
    description:
      "Hindustan Times provides Indian, international, business, technology, sports and entertainment news.",
    logo: "",
    website: "https://www.hindustantimes.com",
    categories: [
      "India",
      "World",
      "Business",
      "Technology",
      "Sports",
      "Entertainment",
    ],
    region: "India",
    language: "English",
    fetchMethod: "rss",
    provider: "Hindustan Times",
    apiIdentifier: "",
    rssUrl: "https://www.hindustantimes.com/feeds/rss/latest/rssfeed.xml",
    articlesPerDay: 0,
    isActive: true,
    isVerified: true,
    sortOrder: 2,
  },
  {
    name: "The Indian Express",
    slug: "the-indian-express",
    shortName: "TIE",
    description:
      "The Indian Express provides Indian, political, world, business, technology and sports news.",
    logo: "",
    website: "https://indianexpress.com",
    categories: [
      "India",
      "Politics",
      "World",
      "Business",
      "Technology",
      "Sports",
    ],
    region: "India",
    language: "English",
    fetchMethod: "rss",
    provider: "The Indian Express",
    apiIdentifier: "",
    rssUrl: "https://indianexpress.com/feed/",
    articlesPerDay: 0,
    isActive: true,
    isVerified: true,
    sortOrder: 3,
  },
  {
    name: "Dainik Bhaskar",
    slug: "dainik-bhaskar",
    shortName: "DB",
    description:
      "Dainik Bhaskar is a major Hindi news publisher covering India, world affairs, business, sports, entertainment and technology.",
    logo: "",
    website: "https://www.bhaskar.com",
    categories: [
      "India",
      "World",
      "Business",
      "Sports",
      "Entertainment",
      "Technology",
    ],
    region: "India",
    language: "Hindi",
    fetchMethod: "rss",
    provider: "Dainik Bhaskar",
    apiIdentifier: "",
    rssUrl: "",
    articlesPerDay: 0,
    isActive: false,
    isVerified: false,
    sortOrder: 4,
  },
  {
    name: "India Today",
    slug: "india-today",
    shortName: "IT",
    description:
      "India Today provides breaking news and coverage of India, world affairs, business, sports and entertainment.",
    logo: "",
    website: "https://www.indiatoday.in",
    categories: [
      "India",
      "World",
      "Business",
      "Sports",
      "Entertainment",
      "Technology",
    ],
    region: "India",
    language: "English",
    fetchMethod: "rss",
    provider: "India Today",
    apiIdentifier: "",
    rssUrl: "https://www.indiatoday.in/rss",
    articlesPerDay: 0,
    isActive: true,
    isVerified: true,
    sortOrder: 5,
  },
];

const seedSources = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
    );

    console.log("MongoDB connected.");

    await Source.deleteMany({});

    const createdSources = await Source.insertMany(sources);

    console.log(`✅ ${createdSources.length} sources inserted successfully.`);

    createdSources.forEach((source) => {
      console.log(`${source.name} → ${source._id}`);
    });

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Source Seed Error:", error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSources();
