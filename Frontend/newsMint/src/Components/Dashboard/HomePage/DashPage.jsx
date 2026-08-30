import React, { useEffect, useState } from "react";

import DashStatusBar from "./DashStatusBar";
import DashPreferences from "./DashPreferences";
import DashLivePreview from "./DashLivePreview";

import SpinLoader from "../../../common/SpinLoader";

import {
  getMyPreferences,
  updatePreferences,
} from "../../../services/preference.service.js";

import "./style/DashPage.css";

export default function DashPage() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // Fetch Preferences
  // =========================================================

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyPreferences();

        if (!data?.success || !data?.preference) {
          throw new Error("Unable to load your preferences.");
        }

        setPreferences(data.preference);
      } catch (error) {
        console.error("Get Preferences Error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load your preferences.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-page__container dash-page__container--loading">
          <SpinLoader size="medium" />
          <p>Loading your preferences...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error) {
    return (
      <div className="dash-page">
        <div className="dash-page__container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  // =========================================================
  // Local UI Handlers
  // =========================================================

  const handlePauseToggle = (paused) => {
    // Pause/resume API can be added later.
  };

  const handleTopicToggle = (topics) => {
    setPreferences((prev) => ({
      ...prev,
      categories: topics,
    }));
  };

  const handleLanguageChange = (language) => {
    setPreferences((prev) => ({
      ...prev,
      language,
    }));
  };

  const handleTimeChange = (deliveryTime) => {
    setPreferences((prev) => ({
      ...prev,
      deliveryTime,
    }));
  };

  // =========================================================
  // Update Preferences
  // =========================================================

  const handleUpdate = async (updatedPreferences) => {
    // =======================================================
    // Telegram Refresh
    // =======================================================

    if (updatedPreferences?.refreshTelegram) {
      try {
        setError("");

        const data = await getMyPreferences();

        if (!data?.success || !data?.preference) {
          throw new Error("Unable to refresh Telegram status.");
        }

        setPreferences(data.preference);
      } catch (error) {
        console.error("Telegram Refresh Error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to refresh Telegram status.",
        );
      }

      return;
    }

    // =======================================================
    // Update Preferences
    // =======================================================

    try {
      setUpdating(true);
      setError("");

      const payload = {
        categories: updatedPreferences?.categories ?? preferences.categories,

        language: updatedPreferences?.language ?? preferences.language,

        deliveryTime:
          updatedPreferences?.deliveryTime ?? preferences.deliveryTime,

        phoneNumber: updatedPreferences?.phoneNumber ?? preferences.phoneNumber,

        timezone:
          updatedPreferences?.timezone ??
          preferences.timezone ??
          "Asia/Kolkata",
      };

      const response = await updatePreferences(payload);

      if (!response?.success || !response?.preference) {
        throw new Error(response?.message || "Failed to update preferences.");
      }

      // =======================================================
      // Backend UPDATE now returns the COMPLETE preference
      // =======================================================

      setPreferences(response.preference);

      setError("");
    } catch (error) {
      console.error("Update Preferences Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update preferences.",
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dash-page">
      <div className="dash-page__container">
        {/* Status Bar */}
        <DashStatusBar
          nextDigestTime={preferences.nextDigestTime}
          isDeliveryActive={preferences.isDeliveryActive}
          readStreak={preferences.readStreak}
          isPaused={preferences.isDigestPaused}
          onPauseToggle={handlePauseToggle}
        />

        {/* Main Grid */}
        <div className="dash-page__grid">
          {/* Preferences */}
          <DashPreferences
            selectedTopics={preferences.categories}
            selectedLanguage={preferences.language}
            deliveryTime={preferences.deliveryTime}
            phoneNumber={preferences.phoneNumber}
            isTelegramConnected={preferences.telegram?.connected || false}
            sourcesText={
              preferences.sources?.length
                ? `${preferences.sources.length} source${
                    preferences.sources.length > 1 ? "s" : ""
                  } selected`
                : "No sources selected"
            }
            timeZoneText={`All times shown in ${
              preferences.timezone || "Asia/Kolkata"
            }`}
            savedMessage={`Saved — first digest at ${preferences.deliveryTime}`}
            onUpdate={handleUpdate}
            onTopicToggle={handleTopicToggle}
            onLanguageChange={handleLanguageChange}
            onTimeChange={handleTimeChange}
            updating={updating}
          />

          {/* Live Preview */}
          <DashLivePreview
            time={preferences.deliveryTime}
            tags={preferences.categories}
            heading="नमस्कार। आज की मुख्य खबरें:"
            bulletPoints={[
              "Your personalized news will appear here.",
              "News will be generated according to your selected preferences.",
            ]}
            audioDuration="0:20"
            timestamp={preferences.deliveryTime}
          />
        </div>
      </div>
    </div>
  );
}
