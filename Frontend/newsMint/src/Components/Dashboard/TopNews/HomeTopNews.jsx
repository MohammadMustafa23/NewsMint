import React, { useEffect, useState } from "react";
import DashHeroArticle from "./DashHeroArticle";
import DashLanguageToggle from "./DashLanguageToggle";
import DashTrending from "./DashTrending";
import { getMyNews } from "../../../services/news.service.js";
import "./style/HomeTopNews.css";
import SpinLoader from "../../../common/SpinLoader.jsx";

const HomeTopNews = () => {
  // ======================================================
  // NEWS STATE
  // ======================================================

  const [news, setNews] = useState([]);

  const [language, setLanguage] = useState("English");

  // Pagination
  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(false);

  // Initial loading
  const [loading, setLoading] = useState(true);

  // Load More loading
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // INITIAL NEWS FETCH
  // ======================================================

  useEffect(() => {
    const fetchMyNews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyNews(1, 10);

        if (!response.success) {
          setError(response.message || "We couldn't load your daily news.");

          return;
        }

        // First 10 articles
        setNews(response.data.news || []);

        // Language
        setLanguage(response.data.language || "English");

        // Pagination
        setHasMore(response.data.pagination?.hasMore || false);

        setPage(response.data.pagination?.nextPage || 2);
      } catch (error) {
        console.error("Failed to fetch user news:", error);

        setError(
          error.response?.data?.message || "We couldn't load your daily news.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyNews();
  }, []);

  // ======================================================
  // LOAD MORE
  // ======================================================

  const handleLoadMore = async () => {
    // Prevent duplicate requests
    if (loadingMore || !hasMore) {
      return;
    }

    try {
      setLoadingMore(true);

      const response = await getMyNews(page, 10);

      if (!response.success) {
        console.error(response.message || "Failed to load more news.");

        return;
      }

      const newNews = response.data.news || [];

      // Append new articles
      setNews((previousNews) => [...previousNews, ...newNews]);

      // Update pagination
      setHasMore(response.data.pagination?.hasMore || false);

      setPage(response.data.pagination?.nextPage || page + 1);
    } catch (error) {
      console.error("Failed to load more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ======================================================
  // LANGUAGE
  // ======================================================

  const handleLanguageChange = (lang) => {
    const nextLanguage = lang === "HIN" ? "Hindi" : "English";

    setLanguage(nextLanguage);

    // Language switching should later
    // request news in the selected language.
  };

  // ======================================================
  // TRENDING
  // ======================================================

  const handleTopicClick = (topic) => {
  };

  // ======================================================
  // OPEN ARTICLE
  // ======================================================

  const openArticle = (article) => {
    if (!article?.url) {
      return;
    }

    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  // ======================================================
  // CATEGORY CLASS
  // ======================================================

  const getCategoryClass = (category) => {
    return String(category || "general")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ======================================================
  // SUMMARY
  // ======================================================

  const getArticleSummary = (article) => {
    return (
      article.summary ||
      article.description ||
      "A quick look at today's latest developments."
    );
  };

  // ======================================================
  // INITIAL LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container dash-top-news-page__container--state">
          <SpinLoader size="medium" />

          <p>Preparing your daily briefing...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container dash-top-news-page__container--state">
          <div className="dash-news-state">
            <span className="dash-news-state__label">NEWSMINT</span>

            <h2>Your briefing couldn't load</h2>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // EMPTY NEWS
  // ======================================================

  if (!news.length) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container dash-top-news-page__container--state">
          <div className="dash-news-state">
            <span className="dash-news-state__label">NEWSMINT</span>

            <h2>Nothing new for you yet</h2>

            <p>We're not seeing stories that match your interests right now.</p>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // HERO
  // ======================================================

  const heroNews = news[0];

  // ======================================================
  // REMAINING NEWS
  // ======================================================

  const remainingNews = news.slice(1);

  // ======================================================
  // GROUP BY CATEGORY
  // ======================================================

  const groupedNews = remainingNews.reduce((groups, article) => {
    const category = article.category || "General";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(article);

    return groups;
  }, {});

  // ======================================================
  // TRENDING
  // ======================================================

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

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="dash-top-news-page">
      <div className="dash-top-news-page__container">
        {/* ==================================================
            HERO + SIDEBAR
            ================================================== */}

        <div className="dash-top-news-page__top">
          <DashHeroArticle
            label="Top Story Today"
            imageUrl={heroNews.image || ""}
            imageAlt={heroNews.title || "Top news"}
            title={heroNews.title}
            description={getArticleSummary(heroNews)}
            author={heroNews.source?.name || heroNews.author || "NewsMint"}
            readTime={heroNews.readTime || "5 Min Read"}
            buttonText="Read the Story →"
            onReadMore={() => openArticle(heroNews)}
          />

          <aside className="dash-top-news-page__sidebar">
            <DashLanguageToggle
              label="Read In"
              selected={language === "Hindi" ? "HIN" : "ENG"}
              onChange={handleLanguageChange}
            />

            <DashTrending
              title="What's Trending"
              topics={trendingTopics}
              onTopicClick={handleTopicClick}
            />
          </aside>
        </div>

        <div className="dash-top-news-page__divider" />

        {/* ==================================================
            USER NEWS
            ================================================== */}

        <section className="dash-user-news">
          <header className="dash-user-news__header">
            <div>
              <span className="dash-user-news__eyebrow">YOUR DAILY BRIEF</span>

              <h2 className="dash-user-news__title">Stories For You</h2>

              <p className="dash-user-news__subtitle">
                News selected around your interests
              </p>
            </div>

            <div className="dash-user-news__total">
              <strong>{news.length}</strong>

              <span>Stories</span>
            </div>
          </header>

          {/* ==================================================
              CATEGORY NEWS
              ================================================== */}

          <div className="dash-user-news__categories">
            {Object.entries(groupedNews).map(([category, articles]) => {
              const categoryClass = getCategoryClass(category);

              return (
                <section
                  key={category}
                  className={`dash-user-news__category dash-user-news__category--${categoryClass}`}
                >
                  <div className="dash-user-news__category-header">
                    <div className="dash-user-news__category-title-wrap">
                      <span className="dash-user-news__category-dot" />

                      <h3>{category}</h3>
                    </div>

                    <span className="dash-user-news__category-count">
                      {articles.length}{" "}
                      {articles.length === 1 ? "Story" : "Stories"}
                    </span>
                  </div>

                  <div className="dash-user-news__grid">
                    {articles.map((article, index) => {
                      const source =
                        article.source?.shortName ||
                        article.source?.name ||
                        "NewsMint";

                      return (
                        <article
                          key={article._id || article.id}
                          className={`dash-user-news__card ${
                            index === 0 ? "dash-user-news__card--featured" : ""
                          }`}
                          onClick={() => openArticle(article)}
                          role="link"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              openArticle(article);
                            }
                          }}
                        >
                          {article.image && (
                            <div className="dash-user-news__image-wrap">
                              <img
                                src={article.image}
                                alt={article.title || "News"}
                                className="dash-user-news__image"
                                loading="lazy"
                              />
                            </div>
                          )}

                          <div className="dash-user-news__content">
                            <div className="dash-user-news__meta">
                              <span className="dash-user-news__source">
                                {source}
                              </span>

                              <span className="dash-user-news__separator">
                                •
                              </span>

                              <span className="dash-user-news__category-name">
                                {category}
                              </span>
                            </div>

                            <h4 className="dash-user-news__card-title">
                              {article.title}
                            </h4>

                            <p className="dash-user-news__card-summary">
                              {getArticleSummary(article)}
                            </p>

                            <div className="dash-user-news__card-footer">
                              <span className="dash-user-news__read-time">
                                {article.readTime || "4 Min Read"}
                              </span>

                              <span className="dash-user-news__arrow">→</span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ==================================================
              LOAD MORE
              ================================================== */}

          {hasMore && (
            <div className="dash-user-news__load-more">
              <button
                type="button"
                className="dash-user-news__load-more-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className="dash-user-news__load-spinner" />
                    Loading stories...
                  </>
                ) : (
                  <>
                    Load More Stories
                    <span>↓</span>
                  </>
                )}
              </button>

              <p className="dash-user-news__load-more-hint">
                More stories are waiting for you
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomeTopNews;
