import React from "react";
import DashStatusBar from "./DashStatusBar";
import DashPreferences from "./DashPreferences";
import DashLivePreview from "./DashLivePreview";
import "./style/DashPage.css";

const DashPage = () => {
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

  const handleUpdate = () => {
    console.log("Preferences updated!");
  };

  return (
    <div className="dash-page">
      <div className="dash-page__container">
        {/* Status Bar */}
        <DashStatusBar
          nextDigestTime="in 4h 12m"
          isDeliveryActive={true}
          readStreak={12}
          isPaused={false}
          onPauseToggle={handlePauseToggle}
        />

        {/* Main Grid */}
        <div className="dash-page__grid">
          <DashPreferences
            selectedTopics={["Tech", "Rajasthan"]}
            selectedLanguage="Hindi"
            deliveryTime="7:30 AM"
            phoneNumber="98765 43210"
            sourcesText="via TechCrunch, Economic Times"
            timeZoneText="All times shown in IST (Asia/Kolkata)"
            savedMessage="Saved — first digest at 7:30 AM"
            onUpdate={handleUpdate}
            onTopicToggle={handleTopicToggle}
            onLanguageChange={handleLanguageChange}
            onTimeChange={handleTimeChange}
          />

          <DashLivePreview
            time="7:30"
            tags={["Tech", "Rajasthan"]}
            heading="नमस्कार जयेश। आज की मुख्य खबरें:"
            bulletPoints={[
              "राजस्थान का नया एआई रिसर्च पार्क: जयपुर में 500 करोड़ रुपये की लागत से नया तकनीकी केंद्र स्थापित किया जाएगा।",
              "डेटा प्राइवेसी पर नया बिल: टेक कंपनियों के लिए नए नियम अगले महीने से लागू होंगे।",
            ]}
            audioDuration="0:20"
            timestamp="7:30 AM"
          />
        </div>
      </div>
    </div>
  );
};

export default DashPage;
