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

        console.log("My Preferences:", data);

        if (!data?.success || !data?.preference) {
          setError("Unable to load your preferences.");
          return;
        }

        setPreferences(data.preference);
      } catch (error) {
        console.error("Get Preferences Error:", error);

        setError(
          error?.response?.data?.message || "Failed to load your preferences.",
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

  if (!loading && error) {
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
  // Local UI handlers
  // =========================================================

  const handlePauseToggle = (paused) => {
    console.log("Digest paused:", paused);

    // Later:
    // API for pause/resume digest
  };

  const handleTopicToggle = (topics) => {
    console.log("Topics changed:", topics);

    setPreferences((prev) => ({
      ...prev,
      categories: topics,
    }));
  };

  const handleLanguageChange = (lang) => {
    console.log("Language changed:", lang);

    setPreferences((prev) => ({
      ...prev,
      language: lang,
    }));
  };

  const handleTimeChange = (time) => {
    console.log("Delivery time changed:", time);

    setPreferences((prev) => ({
      ...prev,
      deliveryTime: time,
    }));
  };

  // =========================================================
  // UPDATE PREFERENCES
  // =========================================================
  const handleUpdate = async (updatedPreferences) => {
    // Telegram status refresh only
    if (updatedPreferences?.refreshTelegram) {
      try {
        setError("");

        const data = await getMyPreferences();

        if (!data?.success || !data?.preference) {
          throw new Error("Unable to refresh Telegram status.");
        }

        setPreferences(data.preference);

        console.log("✅ Telegram status refreshed");
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

    // Existing save logic continues here...
    try {
      setUpdating(true);
      setError("");

      console.log("Updating Preferences:", updatedPreferences);

      const response = await updatePreferences({
        categories: updatedPreferences.categories ?? preferences.categories,

        language: updatedPreferences.language ?? preferences.language,

        deliveryTime:
          updatedPreferences.deliveryTime ?? preferences.deliveryTime,

        phoneNumber: updatedPreferences.phoneNumber ?? preferences.phoneNumber,

        timezone:
          updatedPreferences.timezone ?? preferences.timezone ?? "Asia/Kolkata",

        telegram: updatedPreferences.telegram ?? preferences.telegram,
      });

      console.log("Updated Preferences Response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update preferences.");
      }

      // Update UI with backend response
      setPreferences((prev) => ({
        ...prev,

        ...response.preference,

        telegram: {
          ...prev.telegram,
          ...response.preference?.telegram,
        },
      }));

      console.log("✅ Preferences updated successfully");
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
          <DashPreferences
            selectedTopics={preferences.categories}
            selectedLanguage={preferences.language}
            deliveryTime={preferences.deliveryTime}
            phoneNumber={preferences.phoneNumber}
            isTelegramConnected={preferences.telegram?.connected || false}
            sourcesText={
              preferences.sources?.length
                ? `via ${preferences.sources.join(", ")}`
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
