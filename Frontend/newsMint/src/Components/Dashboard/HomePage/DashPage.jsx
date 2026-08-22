import React, { useEffect, useState } from "react";

import DashStatusBar from "./DashStatusBar";
import DashPreferences from "./DashPreferences";
import DashLivePreview from "./DashLivePreview";

import SpinLoader from "../../../common/SpinLoader";

import { getMyPreferences } from "../../../services/prefrence.service";

import "./style/DashPage.css";

const DashPage = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handlePauseToggle = (paused) => {
    console.log("Digest paused:", paused);
  };

  const handleTopicToggle = (topics) => {
    console.log("Topics updated:", topics);
  };

  const handleLanguageChange = (lang) => {
    console.log("Language changed:", lang);
  };

  const handleTimeChange = () => {
    console.log("Open time picker");
  };

  const handleUpdate = (updatedPreferences) => {
    console.log("Preferences updated:", updatedPreferences);
  };

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
};

export default DashPage;
