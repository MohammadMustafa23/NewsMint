import React from "react";
import "./style/DashTrending.css";

const DEFAULT_TOPICS = [
  { category: "Technology", tag: "#AIResearch", mentions: "24k mentions" },
  {
    category: "Regional Business",
    tag: "#JaipurStartups",
    mentions: "18k mentions",
  },
  { category: "Economy", tag: "#GlobalTrade", mentions: "15k mentions" },
  {
    category: "Environment",
    tag: "#ClimateSummit24",
    mentions: "12k mentions",
  },
];

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
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const DashTrending = ({
  title = "Trending Now",
  topics = DEFAULT_TOPICS,
  onTopicClick,
}) => {
  return (
    <div className="dash-trending">
      <div className="dash-trending__header">
        <TrendIcon />
        <span>{title}</span>
      </div>

      <div className="dash-trending__list">
        {topics.map((topic, idx) => (
          <button
            key={idx}
            type="button"
            className="dash-trending__item"
            onClick={() => onTopicClick?.(topic.tag)}
          >
            <div className="dash-trending__item-left">
              <span className="dash-trending__category">{topic.category}</span>
              <span className="dash-trending__tag">{topic.tag}</span>
            </div>
            <span className="dash-trending__mentions">{topic.mentions}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashTrending;
