import React, { useEffect, useState } from "react";
import api from "../../../services/axois.js";
import SpinLoader from "../../../common/SpinLoader.jsx";
import "./style/DashPreferences.css";
import { connectTelegram } from "../../../services/telegram.service.js";

const TOPICS = [
  "India",
  "Technology",
  "Artificial Intelligence",
  "Business",
  "Finance & Markets",
  "World",
  "Science",
  "Space",
  "Cybersecurity",
  "Startups",
  "Education & Careers",
  "Health",
  "Sports",
  "Entertainment",
  "Environment & Climate",
];

const LANGUAGES = ["English", "Hindi"];

// ======================================================
// DELIVERY TIME
// ======================================================

const DELIVERY_TIMES = [
  {
    value: "07:00 AM (IST)",
    label: "7:00 AM (IST)",
  },
  {
    value: "07:30 AM (IST)",
    label: "7:30 AM (IST)",
  },
  {
    value: "08:00 AM (IST)",
    label: "8:00 AM (IST)",
  },
];

const CUSTOM_TIME_VALUE = "CUSTOM";

const DashPreferences = ({
  selectedTopics = [],
  selectedLanguage = "English",
  deliveryTime = "",
  phoneNumber = "",
  isTelegramConnected = false,
  sourcesText = "",
  timeZoneText = "All times shown in IST (Asia/Kolkata)",
  savedMessage = "",
  onUpdate,
  onTopicToggle,
  onLanguageChange,
  onTimeChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTelegramConnecting, setIsTelegramConnecting] = useState(false);
  const [topics, setTopics] = useState(selectedTopics);
  const [language, setLanguage] = useState(selectedLanguage);
  const [phone, setPhone] = useState(phoneNumber);

  // ======================================================
  // CUSTOM TIME STATE
  // ======================================================

  const [isCustomTime, setIsCustomTime] = useState(
    deliveryTime !== "" &&
      !DELIVERY_TIMES.some((time) => time.value === deliveryTime),
  );

  // ======================================================
  // TOPICS
  // ======================================================

  const toggleTopic = (topic) => {
    if (!isEditing) return;

    const next = topics.includes(topic)
      ? topics.filter((t) => t !== topic)
      : [...topics, topic];

    setTopics(next);
    onTopicToggle?.(next);
  };

  // ======================================================
  // LANGUAGE
  // ======================================================

  const handleLanguage = (lang) => {
    if (!isEditing) return;

    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  // ======================================================
  // DELIVERY TIME
  // ======================================================

  const handleTimeChange = (value) => {
    if (!isEditing) return;

    // Custom time selected
    if (value === CUSTOM_TIME_VALUE) {
      setIsCustomTime(true);
      return;
    }

    // Preset time selected
    setIsCustomTime(false);

    onTimeChange?.(value);
  };

  // ======================================================
  // CUSTOM DELIVERY TIME
  // ======================================================

  const handleCustomTimeChange = (event) => {
    if (!isEditing) return;

    const value = event.target.value;

    if (!value) return;

    const [hours, minutes] = value.split(":");

    let hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
      hour = 12;
    } else if (hour > 12) {
      hour -= 12;
    }

    const formattedTime = `${String(hour).padStart(
      2,
      "0",
    )}:${minutes} ${period} (IST)`;

    onTimeChange?.(formattedTime);
  };

  // ======================================================
  // CUSTOM TIME → INPUT VALUE
  // ======================================================

  const getCustomTimeValue = () => {
    if (!deliveryTime || !isCustomTime) {
      return "";
    }

    const match = deliveryTime.match(/^(\d{2}):(\d{2})\s+(AM|PM)/);

    if (!match) {
      return "";
    }

    let hour = Number(match[1]);
    const minutes = match[2];
    const period = match[3];

    if (period === "AM") {
      if (hour === 12) {
        hour = 0;
      }
    } else if (period === "PM") {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  };

  // ======================================================
  // UPDATE
  // ======================================================

  const handleUpdateClick = () => {
    if (!isEditing) {
      // First click → enable editing
      setIsEditing(true);
      return;
    }

    onUpdate?.({
      categories: topics,
      language,
      deliveryTime,
      phoneNumber: phone,
    });

    setIsEditing(false);
  };

  // ======================================================
  // TELEGRAM
  // ======================================================

  const handleTelegramConnect = async () => {
    if (isTelegramConnecting) return;

    try {
      setIsTelegramConnecting(true);

      await connectTelegram({
        onConnected: () => {
          setIsTelegramConnecting(false);

          // Parent should refresh preferences here
          onUpdate?.({
            refreshTelegram: true,
          });
        },

        onTimeout: () => {
          setIsTelegramConnecting(false);
        },
      });
    } catch (error) {
      console.error("Telegram connection failed:", error);

      setIsTelegramConnecting(false);
    }
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

          <div className="dash-pref-time-wrapper">
            {/* Time Select */}
            <select
              value={isCustomTime ? CUSTOM_TIME_VALUE : deliveryTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={!isEditing}
              className={`dash-pref-dropdown ${
                !isEditing ? "dash-pref-dropdown--readonly" : ""
              }`}
            >
              <option value="" disabled>
                Select delivery time
              </option>

              {DELIVERY_TIMES.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}

              <option value={CUSTOM_TIME_VALUE}>Custom time</option>
            </select>

            {/* Custom Time Picker */}
            {isCustomTime && (
              <input
                type="time"
                value={getCustomTimeValue()}
                onChange={handleCustomTimeChange}
                disabled={!isEditing}
                className="dash-pref-custom-time"
                aria-label="Custom delivery time"
              />
            )}
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
            maxLength={10}
            onChange={(e) => setPhone(e.target.value)}
            className="dash-pref-phone__input"
            readOnly={!isEditing}
          />
        </div>
      </div>

      {/* Telegram */}
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
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>

          <span>Telegram</span>
        </div>

        <div className="dash-pref-telegram">
          {isTelegramConnected ? (
            <>
              <div className="dash-pref-telegram__status dash-pref-telegram__status--connected">
                <span className="dash-pref-telegram__dot" />
                <span>Telegram Connected</span>
              </div>

              <span className="dash-pref-telegram__badge">Connected</span>
            </>
          ) : (
            <>
              <div className="dash-pref-telegram__status dash-pref-telegram__status--disconnected">
                <span className="dash-pref-telegram__dot" />
                <span>Telegram Not Connected</span>
              </div>

              <button
                type="button"
                className="dash-pref-telegram__connect-btn"
                onClick={handleTelegramConnect}
                disabled={!isEditing}
              >
                {isTelegramConnecting
                  ? "Waiting for Telegram..."
                  : "Connect Telegram"}
              </button>
            </>
          )}
        </div>
      </div>

      <hr className="dash-pref-divider" />

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
