import React from "react";
import "./style/DashHeroArticle.css";

const DashHeroArticle = ({
  label = "Headline of the Day",
  imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
  imageAlt = "Featured article",
  title = "Global Markets Rally Following Unexpected Shifts in Continental Trade Policy",
  description = "In an unprecedented move that caught many leading analysts off guard, key continental powers have signed a provisional accord restructuring tariffs across major tech and agriculture sectors, sending ripples of optimism through early morning trading sessions.",
  author = "Jonathan Reed",
  readTime = "8 Min Read",
  buttonText = "Read Full Story",
  onReadMore,
}) => {
  return (
    <article className="dash-hero-article">
      {/* Section Label */}
      <div className="dash-hero-article__label">
        <div className="dash-hero-article__label-line" />
        <span>{label}</span>
      </div>

      {/* Hero Image */}
      <div className="dash-hero-article__image-wrap">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="dash-hero-article__image"
        />
      </div>

      {/* Title */}
      <h1 className="dash-hero-article__title">{title}</h1>

      {/* Description */}
      <p className="dash-hero-article__desc">{description}</p>

      {/* Footer */}
      <div className="dash-hero-article__footer">
        <div className="dash-hero-article__meta">
          <span>
            By <strong>{author}</strong>
          </span>
          <span className="dash-hero-article__dot">•</span>
          <span>{readTime}</span>
        </div>
        <button
          type="button"
          className="dash-hero-article__btn"
          onClick={onReadMore}
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
};

export default DashHeroArticle;
