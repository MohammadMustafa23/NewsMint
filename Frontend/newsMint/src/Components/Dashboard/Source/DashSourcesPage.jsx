import React from "react";
import DashSourceHeader from "./DashSourceHeader";
import DashSourceToolbar from "./DashSourceToolbar";
import DashSourceGrid from "./DashSourceGrid";
import "./style/DashSourcesPage.css";

const DashSourcesPage = () => {
  const handleSearch = (query) => {
    console.log("Search:", query);
  };

  const handleFilterChange = (filter) => {
    console.log("Filter:", filter);
  };

  const handleToggleSource = (id, isAdded) => {
    console.log("Toggle source:", id, isAdded);
  };

  const handleLoadMore = () => {
    console.log("Load more sources");
  };

  return (
    <div className="dash-sources-page">
      <div className="dash-sources-page__container">
        <DashSourceHeader
          title="Choose your sources"
          subtitle="NewsMint only summarizes from outlets you trust. Add or remove sources anytime — your digest updates instantly."
          infoText="Select up to 3 sources"
          selectedCount={5}
          totalCount={5}
        />

        <DashSourceToolbar
          filters={["All", "Tech", "Business", "India", "Markets", "Startups"]}
          activeFilter="All"
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        <DashSourceGrid
          onToggleSource={handleToggleSource}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
};

export default DashSourcesPage;
