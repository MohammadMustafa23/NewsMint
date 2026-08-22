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
      "Education & Careers",
      "Health",
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
      "Business",
      "Finance & Markets",
      "Education & Careers",
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
      "The Indian Express provides Indian, world, business, technology, sports and education news.",
    logo: "",
    website: "https://indianexpress.com",

    categories: ["India", "Education & Careers"],

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

    categories: ["India", "Sports"],

    region: "India",
    language: "English",

    fetchMethod: "rss",
    provider: "India Today",
    apiIdentifier: "",

    rssUrl: "https://www.indiatoday.in/rss/home",

    articlesPerDay: 0,

    isActive: true,
    isVerified: true,

    sortOrder: 5,
  },

  {
    name: "The Guardian",
    slug: "the-guardian",
    shortName: "GUARD",
    description:
      "The Guardian provides international news, technology, science, sports and environmental coverage.",
    logo: "",
    website: "https://www.theguardian.com",

    categories: [
      "Technology",
      "Artificial Intelligence",
      "World",
      "Science",
      "Space",
      "Cybersecurity",
      "Startups",
      "Health",
      "Environment & Climate",
    ],

    region: "Global",
    language: "English",

    fetchMethod: "api",
    provider: "The Guardian",
    apiIdentifier: "guardian",

    rssUrl: "",

    articlesPerDay: 20,

    isActive: true,
    isVerified: true,

    sortOrder: 6,
  },

  {
    name: "NewsData.io",
    slug: "newsdata-io",
    shortName: "ND",
    description:
      "NewsData.io provides aggregated news from multiple publishers worldwide.",
    logo: "",
    website: "https://newsdata.io",

    categories: [
      "Technology",
      "Artificial Intelligence",
      "Business",
      "Finance & Markets",
      "World",
      "Science",
      "Space",
      "Cybersecurity",
      "Startups",
      "Education & Careers",
      "Health",
      "Sports",
      "Entertainment",
      "Environment & Climate",
    ],

    region: "Global",
    language: "English",

    fetchMethod: "api",
    provider: "NewsData.io",
    apiIdentifier: "newsdata",

    rssUrl: "",

    articlesPerDay: 10,

    isActive: true,
    isVerified: true,

    sortOrder: 7,
  },

  {
    name: "GNews",
    slug: "gnews",
    shortName: "GNEWS",
    description:
      "GNews provides aggregated news from publishers around the world.",
    logo: "",
    website: "https://gnews.io",

    categories: [
      "India",
      "Technology",
      "Artificial Intelligence",
      "Business",
      "Finance & Markets",
      "World",
      "Science",
      "Space",
      "Cybersecurity",
      "Startups",
      "Education & Careers",
      "Health",
      "Sports",
      "Entertainment",
      "Environment & Climate",
    ],

    region: "Global",
    language: "English",

    fetchMethod: "api",
    provider: "GNews",
    apiIdentifier: "gnews",

    rssUrl: "",

    articlesPerDay: 10,

    isActive: true,
    isVerified: true,

    sortOrder: 8,
  },
];
const seedSources = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

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
