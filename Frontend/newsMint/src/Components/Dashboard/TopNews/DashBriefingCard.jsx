import React from "react";
import "./style/DashBriefingCard.css";

const DashBriefingCard = ({
  icon = "🏛",
  category = "The Chronical",
  title = "Central Bank Signals Pause on Interest Rate Hikes Amidst Inflation Data",
  description = "Following three consecutive quarters of aggressive tightening, policymakers hinted at a more measured approach in the coming...",
  buttonText = "Read Summary",
  onRead,
}) => {
  return (
    <article className="dash-briefing-card">
      {/* Header: Icon + Category */}
      <div className="dash-briefing-card__header">
        <div className="dash-briefing-card__icon">{icon}</div>
        <span className="dash-briefing-card__category">{category}</span>
      </div>

      {/* Title */}
      <h3 className="dash-briefing-card__title">{title}</h3>

      {/* Description */}
      <p className="dash-briefing-card__desc">{description}</p>

      {/* Button */}
      <button
        type="button"
        className="dash-briefing-card__btn"
        onClick={onRead}
      >
        {buttonText}
      </button>
    </article>
  );
};

export default DashBriefingCard;
