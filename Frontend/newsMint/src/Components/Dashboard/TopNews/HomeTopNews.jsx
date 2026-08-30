import React, { useEffect, useState } from "react";

import DashHeroArticle from "./DashHeroArticle";
import DashLanguageToggle from "./DashLanguageToggle";
import DashTrending from "./DashTrending";

import { getTopNews, getCategoryNews } from "../../../services/news.service.js";

import SpinLoader from "../../../common/SpinLoader.jsx";

import "./style/HomeTopNews.css";

const HomeTopNews = () => {
  // ======================================================
  // CATEGORY BUTTONS
  // ======================================================
  //
  // These are UI categories.
  //
  // Backend will handle which news belongs
  // to the selected category.
  //
  // ======================================================

  const categories = [
    "all",
    "India",
    "Technology",
    "Sports",
    "Business",
    "Entertainment",
    "World",
  ];

  // ======================================================
  // NEWS
  // ======================================================

  const [news, setNews] = useState([]);

  // ======================================================
  // LANGUAGE
  // ======================================================

  const [language, setLanguage] = useState("English");

  // ======================================================
  // SELECTED CATEGORY
  // ======================================================

  const [category, setCategory] = useState("all");

  // ======================================================
  // PAGINATION
  // ======================================================

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(false);

  // ======================================================
  // LOADING
  // ======================================================

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // FETCH NEWS
  // ======================================================
  //
  // ALL:
  //   getTopNews()
  //
  // CATEGORY:
  //   getCategoryNews()
  //
  // Every first request gets maximum 10.
  //
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const fetchNews = async () => {
      try {
        setLoading(true);

        setError("");

        // Clear previous category news.
        setNews([]);

        let response;

        // ==================================================
        // ALL NEWS
        // ==================================================

        if (category.toLowerCase() === "all") {
          response = await getTopNews(1, 10);
        }

        // ==================================================
        // CATEGORY NEWS
        // ==================================================
        else {
          response = await getCategoryNews(category, 1, 10);
        }

        if (cancelled) {
          return;
        }

        // ==================================================
        // API ERROR
        // ==================================================

        if (!response?.success) {
          setError(response?.message || "We couldn't load the latest news.");

          return;
        }

        // ==================================================
        // NEWS
        // ==================================================

        const responseNews = response?.data?.news || [];

        // ==================================================
        // PAGINATION
        // ==================================================

        const pagination = response?.data?.pagination || {};

        setNews(responseNews);

        setHasMore(Boolean(pagination.hasMore));

        setPage(pagination.nextPage || 2);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch news:", error);

        setError(
          error?.response?.data?.message || "We couldn't load the latest news.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, [category]);

  // ======================================================
  // LOAD MORE
  // ======================================================
  //
  // ALL:
  //   /top?page=2
  //
  // CATEGORY:
  //   /category-news?category=India&page=2
  //
  // ======================================================

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    try {
      setLoadingMore(true);

      let response;

      // ==================================================
      // ALL
      // ==================================================

      if (category.toLowerCase() === "all") {
        response = await getTopNews(page, 10);
      }

      // ==================================================
      // CATEGORY
      // ==================================================
      else {
        response = await getCategoryNews(category, page, 10);
      }

      if (!response?.success) {
        console.error(response?.message || "Failed to load more news.");

        return;
      }

      const newNews = response?.data?.news || [];

      const pagination = response?.data?.pagination || {};

      // ==================================================
      // APPEND
      // ==================================================

      setNews((previousNews) => [...previousNews, ...newNews]);

      // ==================================================
      // PAGINATION
      // ==================================================

      setHasMore(Boolean(pagination.hasMore));

      setPage(pagination.nextPage || page + 1);
    } catch (error) {
      console.error("Failed to load more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ======================================================
  // CATEGORY CHANGE
  // ======================================================

  const handleCategoryChange = (nextCategory) => {
    if (typeof nextCategory !== "string") {
      return;
    }

    const selectedCategory = nextCategory.trim();

    if (!selectedCategory) {
      return;
    }

    console.log("Selected category:", selectedCategory);

    // useEffect will automatically:
    //
    // 1. Clear old news
    // 2. Request page 1
    // 3. Get maximum 10
    // 4. Reset pagination
    //

    setCategory(selectedCategory);
  };

  // ======================================================
  // LANGUAGE
  // ======================================================

  const handleLanguageChange = (lang) => {
    setLanguage(lang === "HIN" ? "Hindi" : "English");
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

  const getCategoryClass = (value) => {
    return String(value || "general")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ======================================================
  // ACTIVE CATEGORY
  // ======================================================

  const isCategoryActive = (selectedCategory) => {
    return (
      String(category).toLowerCase() === String(selectedCategory).toLowerCase()
    );
  };

  // ======================================================
  // SUMMARY
  // ======================================================

  const getArticleSummary = (article) => {
    if (language === "Hindi") {
      return (
        article?.summary?.hindi ||
        article?.description ||
        "आज की ताज़ा खबरों की एक झलक।"
      );
    }

    return (
      article?.summary?.english ||
      article?.description ||
      "A quick look at the latest developments."
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

          <p>Preparing the latest news...</p>
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

            <h2>Top News couldn't load</h2>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // EMPTY
  // ======================================================

  if (!news.length) {
    return (
      <div className="dash-top-news-page">
        <div className="dash-top-news-page__container dash-top-news-page__container--state">
          <div className="dash-news-state">
            <span className="dash-news-state__label">NEWSMINT</span>

            <h2>No news available right now</h2>

            <p>There are no recent stories available for this category.</p>
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
    const articleCategory = article?.category || "General";

    if (!groups[articleCategory]) {
      groups[articleCategory] = [];
    }

    groups[articleCategory].push(article);

    return groups;
  }, {});

  // ======================================================
  // TRENDING
  // ======================================================

  const trendingTopics = [
    ...new Map(
      news.flatMap((article) =>
        (article?.tags || []).map((tag) => [
          tag,
          {
            category: article?.category || "General",

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
              onTopicClick={() => {}}
            />
          </aside>
        </div>

        <div className="dash-top-news-page__divider" />

        {/* ==================================================
            TOP NEWS
            ================================================== */}

        <section className="dash-user-news">
          {/* HEADER */}

          <header className="dash-user-news__header">
            <div>
              <span className="dash-user-news__eyebrow">LATEST NEWS</span>

              <h2 className="dash-user-news__title">Top News</h2>

              <p className="dash-user-news__subtitle">
                Latest stories across all categories
              </p>
            </div>

            <div className="dash-user-news__total">
              <strong>{news.length}</strong>

              <span>{news.length === 1 ? "Story" : "Stories"}</span>
            </div>
          </header>

          {/* ==================================================
              CATEGORY BUTTONS
              ================================================== */}

          <div className="dash-top-news__filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={isCategoryActive(item) ? "active" : ""}
                onClick={() => handleCategoryChange(item)}
              >
                {item.toLowerCase() === "all" ? "All" : item}
              </button>
            ))}
          </div>

          {/* ==================================================
              CATEGORY NEWS
              ================================================== */}

          <div className="dash-user-news__categories">
            {Object.entries(groupedNews).map(([articleCategory, articles]) => {
              const categoryClass = getCategoryClass(articleCategory);

              return (
                <section
                  key={articleCategory}
                  className={`dash-user-news__category dash-user-news__category--${categoryClass}`}
                >
                  <div className="dash-user-news__category-header">
                    <div className="dash-user-news__category-title-wrap">
                      <span className="dash-user-news__category-dot" />

                      <h3>{articleCategory}</h3>
                    </div>

                    <span className="dash-user-news__category-count">
                      {articles.length}{" "}
                      {articles.length === 1 ? "Story" : "Stories"}
                    </span>
                  </div>

                  <div className="dash-user-news__grid">
                    {articles.map((article, index) => {
                      const source =
                        article?.source?.shortName ||
                        article?.source?.name ||
                        "NewsMint";

                      return (
                        <article
                          key={article.id}
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
                                {articleCategory}
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
                More latest stories are waiting for you
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomeTopNews;
