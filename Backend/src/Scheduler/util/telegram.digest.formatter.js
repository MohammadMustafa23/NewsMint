const CATEGORY_CONFIG = {
  India: "🇮🇳 INDIA",
  Technology: "💻 TECHNOLOGY",
  Sports: "🏏 SPORTS",
  World: "🌍 WORLD",
  Entertainment: "🎬 ENTERTAINMENT",
  General: "📰 GENERAL",

  AI: "🤖 AI",
  Business: "💼 BUSINESS",
  Finance: "💰 FINANCE",
  Science: "🔬 SCIENCE",
  Space: "🚀 SPACE",
  Cybersecurity: "🔐 CYBERSECURITY",
  Startups: "🚀 STARTUPS",
  Education: "🎓 EDUCATION",
  Health: "🏥 HEALTH",
  Environment: "🌱 ENVIRONMENT",
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning! 👋";
  }

  if (hour < 17) {
    return "Good Afternoon! 👋";
  }

  if (hour < 21) {
    return "Good Evening! 👋";
  }

  return "Good Night! 👋";
};

export const formatTelegramDigest = ({ digestNews, language }) => {
  if (!digestNews?.length) {
    return null;
  }

  const isHindi = language === "Hindi";

  const groupedNews = {};

  for (const article of digestNews) {
    const category = article.category || "General";

    if (!groupedNews[category]) {
      groupedNews[category] = [];
    }

    groupedNews[category].push(article);
  }

  // Display order for all supported categories
  const categoryOrder = [
    "India",
    "World",
    "Technology",
    "Business",
    "Finance",
    "AI",
    "Science",
    "Space",
    "Cybersecurity",
    "Startups",
    "Education",
    "Health",
    "Environment",
    "Sports",
    "Entertainment",
    "General",
  ];

  const lines = [];

  lines.push("📰 NEWSMINT DAILY DIGEST");
  lines.push("");

  lines.push(getGreeting());
  lines.push("");

  if (isHindi) {
    lines.push("Aaj ki important news aapki selected categories ke according:");
  } else {
    lines.push(
      "Here are today's top stories based on your selected interests.",
    );
  }

  lines.push("");

  let articleNumber = 1;

  // First process all known categories in defined order
  for (const category of categoryOrder) {
    const news = groupedNews[category];

    if (!news?.length) {
      continue;
    }

    lines.push("━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(CATEGORY_CONFIG[category] || `📰 ${category.toUpperCase()}`);

    lines.push("");

    for (const article of news) {
      lines.push(`${articleNumber}. ${article.title}`);
      lines.push("");

      if (article.summary) {
        lines.push(article.summary);
        lines.push("");
      }

      if (article.url) {
        lines.push(`🔗 Read More: ${article.url}`);
        lines.push("");
      }

      articleNumber++;
    }
  }

  // Safety fallback:
  // If a new category is added in the future but not added
  // to categoryOrder, it will still be included.
  for (const category of Object.keys(groupedNews)) {
    if (categoryOrder.includes(category)) {
      continue;
    }

    const news = groupedNews[category];

    if (!news?.length) {
      continue;
    }

    lines.push("━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(CATEGORY_CONFIG[category] || `📰 ${category.toUpperCase()}`);

    lines.push("");

    for (const article of news) {
      lines.push(`${articleNumber}. ${article.title}`);
      lines.push("");

      if (article.summary) {
        lines.push(article.summary);
        lines.push("");
      }

      if (article.url) {
        lines.push(`🔗 Read More: ${article.url}`);
        lines.push("");
      }

      articleNumber++;
    }
  }

  lines.push("━━━━━━━━━━━━━━");
  lines.push("");

  if (isHindi) {
    lines.push("✨ Bas itna hi for your NewsMint update.");
    lines.push("Stay informed. Stay ahead. 🚀");
  } else {
    lines.push("✨ That's your NewsMint update.");
    lines.push("Stay informed. Stay ahead. 🚀");
  }

  return lines.join("\n").trim();
};
