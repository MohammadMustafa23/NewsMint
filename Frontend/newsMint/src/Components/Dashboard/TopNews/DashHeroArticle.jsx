import React from "react";
import "./style/DashHeroArticle.css";

const DashHeroArticle = ({
  label = "Headline of the Day",
  imageUrl = "",
  imageAlt = "Featured article",
  title = "Featured News",
  description = "",
  author = "",
  readTime = "",
  buttonText = "Read Full Story",
  onReadMore,
}) => {
  const hasMeta = author || readTime;

  return (
    <article className="dash-hero-article">
      {/* Section Label */}
      <div className="dash-hero-article__label">
        <div className="dash-hero-article__label-line" />
        <span>{label}</span>
      </div>

      {/* Hero Image */}
      {imageUrl && (
        <div className="dash-hero-article__image-wrap">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="dash-hero-article__image"
            loading="lazy"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="dash-hero-article__title">{title}</h1>

      {/* Description / AI Summary */}
      {description && <p className="dash-hero-article__desc">{description}</p>}

      {/* Footer */}
      {hasMeta && (
        <div className="dash-hero-article__footer">
          <div className="dash-hero-article__meta">
            {author && (
              <span>
                By <strong>{author}</strong>
              </span>
            )}

            {author && readTime && (
              <span className="dash-hero-article__dot">•</span>
            )}

            {readTime && <span>{readTime}</span>}
          </div>

          {onReadMore && (
            <button
              type="button"
              className="dash-hero-article__btn"
              onClick={onReadMore}
            >
              {buttonText}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default DashHeroArticle;
