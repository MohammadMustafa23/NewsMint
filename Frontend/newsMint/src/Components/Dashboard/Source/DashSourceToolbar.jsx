import React, { useState } from "react";
import "./style/DashSourceToolbar.css";

const DEFAULT_FILTERS = [
  "All",
  "Tech",
  "Business",
  "India",
  "Markets",
  "Startups",
];

const DashSourceToolbar = ({
  filters = DEFAULT_FILTERS,
  activeFilter = "All",
  searchPlaceholder = "Search sources (e.g. Economic Times)...",
  onSearch,
  onFilterChange,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [active, setActive] = useState(activeFilter);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilter = (filter) => {
    setActive(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="dash-source-toolbar">
      {/* Search Input */}
      <div className="dash-source-toolbar__search">
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearch}
          className="dash-source-toolbar__input"
        />
      </div>

      {/* Filter Pills */}
      <div className="dash-source-toolbar__filters">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`dash-source-toolbar__pill ${active === filter ? "dash-source-toolbar__pill--active" : ""}`}
            onClick={() => handleFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashSourceToolbar;
