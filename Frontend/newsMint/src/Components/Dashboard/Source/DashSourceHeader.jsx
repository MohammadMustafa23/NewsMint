import React from "react";
import "./style/DashSourceHeader.css";

const DashSourceHeader = ({
  title = "Choose your sources",
  subtitle = "NewsMint only summarizes from outlets you trust. Add or remove sources anytime — your digest updates instantly.",
  infoText = "Select up to 3 sources",
  selectedCount = 5,
  totalCount = 5,
  maxLimit = 3,
}) => {
  return (
    <div className="dash-source-header">
      <h1 className="dash-source-header__title">{title}</h1>
      <p className="dash-source-header__subtitle">{subtitle}</p>

      <div className="dash-source-header__meta">
        {/* Info Badge */}
        <div className="dash-source-header__info">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{infoText}</span>
        </div>

        {/* Counter */}
        <div className="dash-source-header__counter">
          <span className="dash-source-header__counter-current">
            {selectedCount}
          </span>
          <span className="dash-source-header__counter-sep">/</span>
          <span className="dash-source-header__counter-total">
            {totalCount}
          </span>
          <span className="dash-source-header__counter-label">
            Sources Selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashSourceHeader;
