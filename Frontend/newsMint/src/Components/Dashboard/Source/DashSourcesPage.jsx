import React, { useEffect, useMemo, useState } from "react";

import DashSourceHeader from "./DashSourceHeader";
import DashSourceToolbar from "./DashSourceToolbar";
import DashSourceGrid from "./DashSourceGrid";

import {
  getAllSources,
  getMySources,
  addSource,
  removeSource,
} from "../../../services/source.service";

import "./style/DashSourcesPage.css";

const SOURCE_LIMIT = 3;

const DashSourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * --------------------------------------------------
   * Fetch Sources
   * --------------------------------------------------
   */
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        setError("");

        const [sourcesData, mySourcesData] = await Promise.all([
          getAllSources(),
          getMySources(),
        ]);

        console.log("All Sources:", sourcesData);
        console.log("My Sources:", mySourcesData);

        if (!sourcesData?.success) {
          throw new Error("Failed to load sources.");
        }

        if (!mySourcesData?.success) {
          throw new Error("Failed to load your selected sources.");
        }

        setSources(sourcesData.sources || []);
        setSelectedSources(mySourcesData.selectedSources || []);
      } catch (error) {
        console.error("Get Sources Error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load sources.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  /*
   * --------------------------------------------------
   * Selected Source IDs
   * --------------------------------------------------
   *
   * /sources/me returns populated source objects.
   * Convert them into IDs for easy checking.
   */
  const selectedSourceIds = useMemo(() => {
    return selectedSources.map((source) =>
      typeof source === "object" ? source._id : source,
    );
  }, [selectedSources]);

  /*
   * --------------------------------------------------
   * Available Filters
   * --------------------------------------------------
   */
  const filters = useMemo(() => {
    const categories = new Set();

    sources.forEach((source) => {
      source.categories?.forEach((category) => {
        categories.add(category);
      });
    });

    return ["All", ...Array.from(categories)];
  }, [sources]);

  /*
   * --------------------------------------------------
   * Filter + Search
   * --------------------------------------------------
   */
  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        source.name?.toLowerCase().includes(query) ||
        source.description?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" || source.categories?.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [sources, searchQuery, activeFilter]);

  /*
   * --------------------------------------------------
   * Search
   * --------------------------------------------------
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  /*
   * --------------------------------------------------
   * Category Filter
   * --------------------------------------------------
   */
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  /*
   * --------------------------------------------------
   * Add / Remove Source
   * --------------------------------------------------
   */
  const handleToggleSource = async (sourceId, isAdded) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      if (isAdded) {
        /*
         * Remove source
         */
        const data = await removeSource(sourceId);

        console.log("Remove Source:", data);

        if (!data?.success) {
          throw new Error(data?.message || "Failed to remove source.");
        }

        setSelectedSources((prev) =>
          prev.filter((source) => {
            const id = typeof source === "object" ? source._id : source;

            return id !== sourceId;
          }),
        );
      } else {
        /*
         * Add source
         */
        if (selectedSourceIds.length >= SOURCE_LIMIT) {
          setError(`You can select a maximum of ${SOURCE_LIMIT} sources.`);
          return;
        }

        const data = await addSource(sourceId);

        console.log("Add Source:", data);

        if (!data?.success) {
          throw new Error(data?.message || "Failed to add source.");
        }

        /*
         * Get the source object from our already-loaded
         * source catalog.
         */
        const addedSource = sources.find((source) => source._id === sourceId);

        if (addedSource) {
          setSelectedSources((prev) => [...prev, addedSource]);
        }
      }
    } catch (error) {
      console.error("Toggle Source Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update source.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * --------------------------------------------------
   * Load More
   * --------------------------------------------------
   *
   * Currently all active sources are fetched at once.
   * Keep this callback ready for pagination later.
   */
  const handleLoadMore = () => {
    console.log("Load more sources");
  };

  /*
   * --------------------------------------------------
   * Loading State
   * --------------------------------------------------
   */
  if (loading) {
    return (
      <div className="dash-sources-page">
        <div className="dash-sources-page__container">
          <p>Loading sources...</p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Error State
   * --------------------------------------------------
   */
  if (error && sources.length === 0) {
    return (
      <div className="dash-sources-page">
        <div className="dash-sources-page__container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-sources-page">
      <div className="dash-sources-page__container">
        <DashSourceHeader
          title="Choose your sources"
          subtitle="NewsMint only summarizes from outlets you trust. Add or remove sources anytime — your digest updates instantly."
          infoText={`Select up to ${SOURCE_LIMIT} sources`}
          selectedCount={selectedSources.length}
          totalCount={SOURCE_LIMIT}
        />

        <DashSourceToolbar
          filters={filters}
          activeFilter={activeFilter}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {error && <p className="dash-sources-page__error">{error}</p>}

        <DashSourceGrid
          sources={filteredSources}
          selectedSourceIds={selectedSourceIds}
          onToggleSource={handleToggleSource}
          onLoadMore={handleLoadMore}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
};

export default DashSourcesPage;
