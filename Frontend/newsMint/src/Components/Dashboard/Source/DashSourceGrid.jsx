import React from "react";
import "./style/DashSourceGrid.css";

const VerifiedIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ArticleIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DashSourceGrid = ({
  sources = [],
  selectedSourceIds = [],
  sectionLabel = "All Sources (A-Z)",
  loadMoreText = "Load More Sources",
  onToggleSource,
  onLoadMore,
  actionLoading = false,
}) => {
  const isSourceSelected = (sourceId) => {
    return selectedSourceIds.includes(sourceId);
  };

  return (
    <div className="dash-source-grid">
      {/* Section Label */}
      <div className="dash-source-grid__label">{sectionLabel}</div>

      {/* Cards Grid */}
      <div className="dash-source-grid__cards">
        {sources.length === 0 ? (
          <p>No sources found.</p>
        ) : (
          sources.map((source) => {
            const isAdded = isSourceSelected(source._id);

            return (
              <div key={source._id} className="dash-source-card">
                {/* Header */}
                <div className="dash-source-card__header">
                  <div className="dash-source-card__logo">
                    {source.shortName}
                  </div>

                  <div className="dash-source-card__info">
                    <div className="dash-source-card__name-row">
                      <span className="dash-source-card__name">
                        {source.name}
                      </span>

                      {source.isVerified && <VerifiedIcon />}
                    </div>

                    <div className="dash-source-card__tags">
                      {source.categories?.map((category, index) => (
                        <React.Fragment key={category}>
                          <span className="dash-source-card__tag">
                            {category}
                          </span>

                          {index < source.categories.length - 1 && (
                            <span className="dash-source-card__tag-sep">•</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="dash-source-card__desc">{source.description}</p>

                {/* Footer */}
                <div className="dash-source-card__footer">
                  <div className="dash-source-card__count">
                    <ArticleIcon />

                    <span>~{source.articlesPerDay}/day</span>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    className={`dash-source-card__btn ${
                      isAdded ? "dash-source-card__btn--added" : ""
                    }`}
                    onClick={() => onToggleSource?.(source._id, isAdded)}
                  >
                    {isAdded ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Added
                      </>
                    ) : (
                      <>
                        <span className="dash-source-card__btn-plus">+</span>
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {sources.length > 0 && (
        <div className="dash-source-grid__load-more">
          <button
            type="button"
            className="dash-source-grid__load-btn"
            onClick={onLoadMore}
          >
            {loadMoreText}
          </button>
        </div>
      )}
    </div>
  );
};

export default DashSourceGrid;
