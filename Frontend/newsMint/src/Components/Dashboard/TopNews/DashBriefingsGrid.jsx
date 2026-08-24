import React from "react";
import DashBriefingCard from "./DashBriefingCard";
import "./style/DashBriefingsGrid.css";

const DashBriefingsGrid = ({
  heading = "Essential Briefings",
  briefings = [],
  buttonText = "Read Summary",
  onReadCard,
}) => {
  return (
    <section className="dash-briefings-grid">
      <h2 className="dash-briefings-grid__heading">{heading}</h2>

      {briefings.length > 0 ? (
        <div className="dash-briefings-grid__cards">
          {briefings.map((item) => (
            <DashBriefingCard
              key={item.id}
              icon={item.icon || "📰"}
              category={item.category || "News"}
              title={item.title || "Untitled News"}
              description={item.description || "No summary available."}
              buttonText={buttonText}
              onRead={() => onReadCard?.(item.id)}
            />
          ))}
        </div>
      ) : (
        <p className="dash-briefings-grid__empty">No briefings available.</p>
      )}
    </section>
  );
};

export default DashBriefingsGrid;
