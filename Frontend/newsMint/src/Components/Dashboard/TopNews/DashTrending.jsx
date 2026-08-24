import React from "react";
import "./style/DashTrending.css";

const TrendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const DashTrending = ({
  title = "Trending Now",
  topics = [],
  onTopicClick,
}) => {
  const validTopics = topics.filter((topic) => topic?.tag);

  return (
    <div className="dash-trending">
      {/* Header */}
      <div className="dash-trending__header">
        <TrendIcon />
        <span>{title}</span>
      </div>

      {/* Topics */}
      <div className="dash-trending__list">
        {validTopics.length > 0 ? (
          validTopics.map((topic, index) => (
            <button
              key={`${topic.tag}-${topic.category || "general"}-${index}`}
              type="button"
              className="dash-trending__item"
              onClick={() => onTopicClick?.(topic)}
            >
              <div className="dash-trending__item-left">
                {topic.category && (
                  <span className="dash-trending__category">
                    {topic.category}
                  </span>
                )}

                <span className="dash-trending__tag">{topic.tag}</span>
              </div>

              {topic.mentions && (
                <span className="dash-trending__mentions">
                  {topic.mentions}
                </span>
              )}
            </button>
          ))
        ) : (
          <div className="dash-trending__empty">
            No trending topics available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashTrending;
