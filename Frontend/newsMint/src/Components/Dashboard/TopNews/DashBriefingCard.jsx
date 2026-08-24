import React from "react";
import "./style/DashBriefingCard.css";

const DashBriefingCard = ({
  icon = "📰",
  category = "News",
  title = "Untitled News",
  description = "",
  buttonText = "Read Summary",
  onRead,
}) => {
  return (
    <article className="dash-briefing-card">
      {/* Header: Icon + Category */}
      <div className="dash-briefing-card__header">
        <div className="dash-briefing-card__icon" aria-hidden="true">
          {icon}
        </div>

        {category && (
          <span className="dash-briefing-card__category">{category}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="dash-briefing-card__title">{title}</h3>

      {/* Description / AI Summary */}
      {description && <p className="dash-briefing-card__desc">{description}</p>}

      {/* Button */}
      {onRead && (
        <button
          type="button"
          className="dash-briefing-card__btn"
          onClick={onRead}
        >
          {buttonText}
        </button>
      )}
    </article>
  );
};

export default DashBriefingCard;
