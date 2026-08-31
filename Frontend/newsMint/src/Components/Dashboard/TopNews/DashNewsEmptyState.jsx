import React from "react";

const DashNewsEmptyState = ({ category = "this category", onBack }) => {
  const isAll = category.toLowerCase() === "all";

  return (
    <div className="dash-news-empty">
      <div className="dash-news-empty__icon">
        <span>⌁</span>
      </div>

      <span className="dash-news-empty__label">NEWSMINT</span>

      <h3>
        {isAll
          ? "No news available right now"
          : `No ${category} news available yet`}
      </h3>

      <p>
        {isAll
          ? "There are no recent stories available right now. Please check again shortly."
          : `We couldn't find any recent stories in ${category}. Try another category or come back later.`}
      </p>

      {!isAll && (
        <button
          type="button"
          className="dash-news-empty__button"
          onClick={onBack}
        >
          <span>←</span>
          Back to Top News
        </button>
      )}
    </div>
  );
};

export default DashNewsEmptyState;
