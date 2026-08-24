import React, { useEffect, useMemo, useState } from "react";

import DashSourceHeader from "./DashSourceHeader";
import DashSourceToolbar from "./DashSourceToolbar";
import DashSourceGrid from "./DashSourceGrid";
import SpinLoader from "../../../common/SpinLoader";

import { getAllSources, getMySources } from "../../../services/source.service";

import {
  getMyPreferences,
  updatePreferences,
} from "../../../services/prefrence.service";

import "./style/DashSourcesPage.css";

const SOURCE_LIMIT = 3;

const DashSourcesPage = () => {
  /* =========================================================
     State
  ========================================================= */

  const [sources, setSources] = useState([]);

  // Currently saved sources from backend
  const [savedSourceIds, setSavedSourceIds] = useState([]);

  // Temporary local selection
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  // Existing preference data required by PUT /preference
  const [preferences, setPreferences] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =========================================================
     Fetch Data
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [sourcesData, mySourcesData, preferencesData] = await Promise.all(
          [getAllSources(), getMySources(), getMyPreferences()],
        );

        console.log("All Sources:", sourcesData);
        console.log("My Sources:", mySourcesData);
        console.log("My Preferences:", preferencesData);

        if (!sourcesData?.success) {
          throw new Error("Failed to load sources.");
        }

        if (!mySourcesData?.success) {
          throw new Error("Failed to load your selected sources.");
        }

        if (!preferencesData?.success || !preferencesData?.preference) {
          throw new Error("Failed to load your preferences.");
        }

        /* -----------------------------------------------------
           All sources
        ----------------------------------------------------- */

        const allSources = sourcesData.sources || [];

        setSources(allSources);

        /* -----------------------------------------------------
           Selected sources
        ----------------------------------------------------- */

        const selected = mySourcesData.selectedSources || [];

        const selectedIds = selected
          .map((source) => (typeof source === "object" ? source._id : source))
          .filter(Boolean);

        setSavedSourceIds(selectedIds);
        setSelectedSourceIds(selectedIds);

        /* -----------------------------------------------------
           Existing preferences
        ----------------------------------------------------- */

        setPreferences(preferencesData.preference);
      } catch (error) {
        console.error("Load Sources Error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load sources.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     Check Unsaved Changes
  ========================================================= */

  const hasUnsavedChanges = useMemo(() => {
    if (selectedSourceIds.length !== savedSourceIds.length) {
      return true;
    }

    const savedSet = new Set(savedSourceIds);

    return selectedSourceIds.some((id) => !savedSet.has(id));
  }, [selectedSourceIds, savedSourceIds]);

  /* =========================================================
     Available Filters
  ========================================================= */

  const filters = useMemo(() => {
    const categories = new Set();

    sources.forEach((source) => {
      source.categories?.forEach((category) => {
        categories.add(category);
      });
    });

    return ["All", ...Array.from(categories)];
  }, [sources]);

  /* =========================================================
     Search + Filter
  ========================================================= */

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sources.filter((source) => {
      const matchesSearch =
        !query ||
        source.name?.toLowerCase().includes(query) ||
        source.description?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" || source.categories?.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [sources, searchQuery, activeFilter]);

  /* =========================================================
     Search
  ========================================================= */

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  /* =========================================================
     Filter
  ========================================================= */

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  /* =========================================================
     Add Source
     ONLY LOCAL STATE
  ========================================================= */

  const handleAddSource = (sourceId) => {
    setError("");
    setSuccessMessage("");

    setSelectedSourceIds((prev) => {
      // Already selected
      if (prev.includes(sourceId)) {
        return prev;
      }

      // Limit
      if (prev.length >= SOURCE_LIMIT) {
        setError(`You can select a maximum of ${SOURCE_LIMIT} sources.`);

        return prev;
      }

      return [...prev, sourceId];
    });
  };

  /* =========================================================
     Remove Source
     ONLY LOCAL STATE
  ========================================================= */

  const handleRemoveSource = (sourceId) => {
    setError("");
    setSuccessMessage("");

    setSelectedSourceIds((prev) => prev.filter((id) => id !== sourceId));
  };

  /* =========================================================
     Toggle Source
  ========================================================= */

  const handleToggleSource = (sourceId, isAdded) => {
    if (isAdded) {
      handleRemoveSource(sourceId);
    } else {
      handleAddSource(sourceId);
    }
  };

  /* =========================================================
     Save Changes
     ONE API REQUEST
  ========================================================= */

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges || saving) {
      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccessMessage("");

      console.log("Saving Sources:", selectedSourceIds);

      /*
       * IMPORTANT:
       * Your backend updatePreferences currently
       * expects the complete preference object.
       */

      const response = await updatePreferences({
        categories: preferences.categories || [],

        sources: selectedSourceIds,

        language: preferences.language,

        deliveryTime: preferences.deliveryTime,

        phoneNumber: preferences.phoneNumber,

        timezone: preferences.timezone || "Asia/Kolkata",

        telegram: preferences.telegram || {
          connected: false,
          chatId: null,
        },
      });

      console.log("Update Preferences Response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update preferences.");
      }

      /* -----------------------------------------------------
         Save successful
      ----------------------------------------------------- */

      setSavedSourceIds(selectedSourceIds);

      setPreferences((prev) => ({
        ...prev,

        sources: selectedSourceIds,
      }));

      setSuccessMessage("Sources updated successfully.");

      console.log("✅ Sources updated successfully");
    } catch (error) {
      console.error("Save Sources Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update sources.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Cancel Changes
  ========================================================= */

  const handleCancelChanges = () => {
    if (saving) return;

    setSelectedSourceIds(savedSourceIds);

    setError("");
    setSuccessMessage("");
  };

  /* =========================================================
     Load More
  ========================================================= */

  const handleLoadMore = () => {
    console.log("Load more sources");
  };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div className="dash-sources-page">
        <div className="dash-sources-page__container dash-sources-page__container--loading">
          <SpinLoader size="medium" />
          <p>Loading sources...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error && sources.length === 0) {
    return (
      <div className="dash-sources-page">
        <div className="dash-sources-page__container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="dash-sources-page">
      <div className="dash-sources-page__container">
        {/* Header */}
        <DashSourceHeader
          title="Choose your sources"
          subtitle="NewsMint only summarizes from outlets you trust. Add or remove sources anytime — your digest updates instantly."
          infoText={`Select up to ${SOURCE_LIMIT} sources`}
          selectedCount={selectedSourceIds.length}
          totalCount={SOURCE_LIMIT}
        />

        {/* Toolbar */}
        <DashSourceToolbar
          filters={filters}
          activeFilter={activeFilter}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {/* Messages */}

        {error && <p className="dash-sources-page__error">{error}</p>}

        {successMessage && (
          <p className="dash-sources-page__success">{successMessage}</p>
        )}

        {/* Sources */}
        <DashSourceGrid
          sources={filteredSources}
          selectedSourceIds={selectedSourceIds}
          onToggleSource={handleToggleSource}
          onLoadMore={handleLoadMore}
          actionLoading={false}
        />

        {/* ===================================================
            Save Bar
        =================================================== */}

        {hasUnsavedChanges && (
          <div className="dash-sources-page__save-bar">
            <div className="dash-sources-page__save-info">
              <strong>Unsaved changes</strong>

              <span>
                {selectedSourceIds.length} of {SOURCE_LIMIT} sources selected
              </span>
            </div>

            <div className="dash-sources-page__save-actions">
              <button
                type="button"
                className="dash-sources-page__cancel-button"
                onClick={handleCancelChanges}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="dash-sources-page__save-button"
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="dash-sources-page__button-spinner" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashSourcesPage;
