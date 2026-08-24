import React, { useEffect, useState } from "react";
import DashHeroArticle from "./DashHeroArticle";
import DashLanguageToggle from "./DashLanguageToggle";
import DashTrending from "./DashTrending";
import { getMyNews } from "../../../services/news.service.js";
import "./style/HomeTopNews.css";

const HomeTopNews = () => {
  const [news, setNews] = useState([]);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyNews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyNews();

        if (response.success) {
          setNews(response.data.news || []);
          setLanguage(response.data.language || "English");
        } else {
          setError(response.message || "Failed to load your news.");
        }
      } catch (error) {
        console.error("Failed to fetch user news:", error);

        setError(error.response?.data?.message || "Failed to load your news.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyNews();
  }, []);

  const handleLanguageChange = (lang) => {
    console.log("Language changed:", lang);
  };

  const handleTopicClick = (topic) => {
    console.log("Clicked topic:", topic);
  };

  const handleReadHero = () => {
    if (!news[0]) return;

    if (news[0].url) {
      window.open(news[0].url, "_blank", "noopener,noreferrer");
    }
  };

  const handleReadBriefing = (article) => {
    if (!article?.url) {
      console.log("Article URL not available");
      return;
    }

    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container">
          <p>Loading your news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container">
          <p>No news available for your selected preferences.</p>
        </div>
      </div>
    );
  }

  // First article = Hero
  const heroNews = news[0];

  /*
   * Remove hero from remaining news.
   * All remaining articles will be shown.
   */
  const remainingNews = news.slice(1);

  /*
   * Group articles by category
   */
  const groupedNews = remainingNews.reduce((groups, article) => {
    const category = article.category || "General";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(article);

    return groups;
  }, {});

  /*
   * Trending topics
   */
  const trendingTopics = [
    ...new Map(
      news.flatMap((article) =>
        (article.tags || []).map((tag) => [
          tag,
          {
            category: article.category || "General",
            tag: tag.startsWith("#") ? tag : `#${tag}`,
            mentions: "Trending",
          },
        ]),
      ),
    ).values(),
  ].slice(0, 4);

  return (
    <div className="dash-top-news-page">
      <div className="dash-top-news-page__container">
        {/* HERO + SIDEBAR */}
        <div className="dash-top-news-page__top">
          <DashHeroArticle
            label="Headline of the Day"
            imageUrl={heroNews.image || ""}
            imageAlt={heroNews.title}
            title={heroNews.title}
            description={
              heroNews.summary ||
              heroNews.description ||
              "No summary available."
            }
            author={heroNews.source?.name || heroNews.author || ""}
            readTime="5 Min Read"
            buttonText="Read Full Story"
            onReadMore={handleReadHero}
          />

          <aside className="dash-top-news-page__sidebar">
            <DashLanguageToggle
              label="Select Language"
              selected={language === "Hindi" ? "HIN" : "ENG"}
              onChange={handleLanguageChange}
            />

            <DashTrending
              title="Trending Now"
              topics={trendingTopics}
              onTopicClick={handleTopicClick}
            />
          </aside>
        </div>

        <hr className="dash-top-news-page__divider" />

        {/* USER NEWS */}
        <section className="dash-user-news">
          <div className="dash-user-news__header">
            <div>
              <h2 className="dash-user-news__title">Your News</h2>

              <p className="dash-user-news__count">{news.length} Articles</p>
            </div>
          </div>

          {/* CATEGORY-WISE NEWS */}
          <div className="dash-user-news__categories">
            {Object.entries(groupedNews).map(([category, articles]) => (
              <section key={category} className="dash-user-news__category">
                <div className="dash-user-news__category-header">
                  <h3>{category}</h3>

                  <span>
                    {articles.length}{" "}
                    {articles.length === 1 ? "Article" : "Articles"}
                  </span>
                </div>

                <div className="dash-user-news__grid">
                  {articles.map((article) => (
                    <article key={article.id} className="dash-user-news__card">
                      {/* IMAGE */}
                      {article.image && (
                        <div className="dash-user-news__image-wrap">
                          <img
                            src={article.image}
                            alt={"Image Not available"}
                            className="dash-user-news__image"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="dash-user-news__content">
                        {/* SOURCE */}
                        <span className="dash-user-news__source">
                          {article.source?.shortName ||
                            article.source?.name ||
                            "NewsMint"}
                        </span>

                        {/* TITLE */}
                        <h4 className="dash-user-news__card-title">
                          {article.title}
                        </h4>

                        {/* SUMMARY */}
                        <p className="dash-user-news__card-summary">
                          {article.summary ||
                            article.description ||
                            "No summary available."}
                        </p>

                        {/* READ BUTTON */}
                        <button
                          type="button"
                          className="dash-user-news__read-btn"
                          onClick={() => handleReadBriefing(article)}
                        >
                          Read Summary
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeTopNews;
