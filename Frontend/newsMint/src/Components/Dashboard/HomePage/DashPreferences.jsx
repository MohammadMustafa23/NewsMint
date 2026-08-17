import React, { useState } from "react";
import "./style/DashPreferences.css";

const TOPICS = ["Tech", "Business", "Rajasthan", "Politics", "Sports"];
const LANGUAGES = ["English", "Hindi"];

const DashPreferences = ({
  selectedTopics = [],
  selectedLanguage = "English",
  deliveryTime = "",
  phoneNumber = "",
  sourcesText = "",
  timeZoneText = "All times shown in IST (Asia/Kolkata)",
  savedMessage = "",
  onUpdate,
  onTopicToggle,
  onLanguageChange,
  onTimeChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [topics, setTopics] = useState(selectedTopics);
  const [language, setLanguage] = useState(selectedLanguage);
  const [phone, setPhone] = useState(phoneNumber);

  const toggleTopic = (topic) => {
    if (!isEditing) return;

    const next = topics.includes(topic)
      ? topics.filter((t) => t !== topic)
      : [...topics, topic];

    setTopics(next);
    onTopicToggle?.(next);
  };

  const handleLanguage = (lang) => {
    if (!isEditing) return;

    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  const handleUpdateClick = () => {
    if (!isEditing) {
      // First click → enable editing
      setIsEditing(true);
      return;
    }

    // Later we'll connect this to update API
    onUpdate?.({
      categories: topics,
      language,
      deliveryTime,
      phoneNumber: phone,
    });

    setIsEditing(false);
  };

  return (
    <div className="dash-preferences">
      {/* Topics */}
      <div className="dash-pref-section">
        <div className="dash-pref-section__header">
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>

          <span>Topics</span>
        </div>

        <div className="dash-pref-pills">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              disabled={!isEditing}
              className={`dash-pref-pill ${
                topics.includes(topic) ? "dash-pref-pill--active" : ""
              } ${!isEditing ? "dash-pref-pill--readonly" : ""}`}
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </button>
          ))}

          <button
            type="button"
            disabled={!isEditing}
            className={`dash-pref-pill dash-pref-pill--add ${
              !isEditing ? "dash-pref-pill--readonly" : ""
            }`}
          >
            <span>+</span> Add More
          </button>
        </div>

        <p className="dash-pref-sources">{sourcesText}</p>
      </div>

      <hr className="dash-pref-divider" />

      {/* Language & Delivery Time */}
      <div className="dash-pref-row">
        {/* Language */}
        <div className="dash-pref-section dash-pref-section--half">
          <div className="dash-pref-section__header">
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
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>

            <span>Language</span>
          </div>

          <div className="dash-pref-toggle">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                disabled={!isEditing}
                className={`dash-pref-toggle__btn ${
                  language === lang ? "dash-pref-toggle__btn--active" : ""
                } ${!isEditing ? "dash-pref-toggle__btn--readonly" : ""}`}
                onClick={() => handleLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Time */}
        <div className="dash-pref-section dash-pref-section--half">
          <div className="dash-pref-section__header">
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
              <polyline points="12 6 12 12 16 14" />
            </svg>

            <span>Delivery Time</span>
          </div>

          <div
            className={`dash-pref-dropdown ${
              !isEditing ? "dash-pref-dropdown--readonly" : ""
            }`}
            onClick={isEditing ? onTimeChange : undefined}
          >
            <span>{deliveryTime}</span>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <p className="dash-pref-timezone">{timeZoneText}</p>
        </div>
      </div>

      <hr className="dash-pref-divider" />

      {/* WhatsApp Number */}
      <div className="dash-pref-section">
        <div className="dash-pref-section__header">
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>

          <span>WhatsApp Number</span>
        </div>

        <div className="dash-pref-phone">
          <span className="dash-pref-phone__prefix">+91</span>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="dash-pref-phone__input"
            readOnly={!isEditing}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="dash-pref-actions">
        <button
          type="button"
          className="dash-pref-btn"
          onClick={handleUpdateClick}
        >
          {isEditing ? "Save Changes" : "Update Preferences"}
        </button>

        <div className="dash-pref-saved">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>

          <span>{savedMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default DashPreferences;
