export const formatTelegramDigest = ({ digestNews, language }) => {
  if (!digestNews?.length) {
    return null;
  }

  const isHindi = language === "Hindi";

  let message = isHindi
    ? "📰 NewsMint Daily Digest\n\n"
    : "📰 NewsMint Daily Digest\n\n";
  digestNews.forEach((article, index) => {
    message += `${index + 1}. ${article.title}\n\n`;
    if (article.summary) {
      message += `${article.summary}\n\n`;
    }
    if (article.url) {
      message += `🔗 Read More: ${article.url}\n\n`;
    }
    message += "──────────────\n\n";
  });

  return message.trim();
};
