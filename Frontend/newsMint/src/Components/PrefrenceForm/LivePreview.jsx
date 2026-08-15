import React, { useEffect, useMemo, useState } from "react";
import "./style/LivePreview.css";

const AnimatedValue = ({ children, className = "" }) => {
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    setIsChanging(true);

    const timer = setTimeout(() => {
      setIsChanging(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [children]);

  return (
    <span
      className={`${className} ${isChanging ? "preview-value--changed" : ""}`}
    >
      {children}
    </span>
  );
};

const LivePreview = ({
  userName = "Jayesh",
  categories = ["Tech", "Markets"],
  language = "English",
  phoneNumber = "98765 43210",
  timestamp = "07:30 AM (IST)",
}) => {
  const [contentChanging, setContentChanging] = useState(false);

  /*
   * -----------------------------------------
   * Language Content
   * -----------------------------------------
   */

  const content = useMemo(() => {
    const isHindi = language === "Hindi";

    if (isHindi) {
      return {
        today: "आज",
        bot: "बॉट",

        greeting: `सुप्रभात ${userName}। आज के लिए आपकी व्यक्तिगत न्यूज़ डाइजेस्ट यहाँ है।`,

        audioDuration: "0:20",

        news: [
          {
            title: "टेक IPO में तीसरी तिमाही में तेजी",
            body: "मार्केट विश्लेषकों के अनुसार टेक कंपनियों के मूल्यांकन में उल्लेखनीय वृद्धि हुई है।",
          },
          {
            title: "जयपुर मेट्रो विस्तार को मंजूरी",
            body: "राज्य कैबिनेट ने ट्रांसपोर्ट नगर को जोड़ने वाले फेज़ 1C को मंजूरी दे दी है।",
          },
        ],

        preferencesTitle: "आपकी प्राथमिकताएँ",
        language: "भाषा",
        categories: "श्रेणियाँ",
        whatsapp: "व्हाट्सऐप",
        noCategories: "कोई श्रेणी नहीं चुनी गई",

        message: "संदेश",
      };
    }

    return {
      today: "TODAY",
      bot: "bot",

      greeting: `Good morning, ${userName}. Here is your personalized news digest for today.`,

      audioDuration: "0:20",

      news: [
        {
          title: "Tech IPOs Surge in Q3",
          body: "Market analysts report a significant uptick in tech valuations...",
        },
        {
          title: "Jaipur Metro Extension Approved",
          body: "The state cabinet cleared Phase 1C connecting transport nagar...",
        },
      ],

      preferencesTitle: "Your Preferences",
      language: "Language",
      categories: "Categories",
      whatsapp: "WhatsApp",
      noCategories: "No categories selected",

      message: "Message",
    };
  }, [language, userName]);

  /*
   * -----------------------------------------
   * Animate Complete Digest On Language Change
   * -----------------------------------------
   */

  useEffect(() => {
    setContentChanging(true);

    const timer = setTimeout(() => {
      setContentChanging(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [language]);

  return (
    <div className="live-preview">
      {/* Preview Label */}
      <div className="live-preview-label">
        <span className="live-dot" />
        <span>Live Preview</span>
      </div>

      {/* Phone */}
      <div className="phone-frame">
        <div className="phone-notch" />

        <div className="phone-screen">
          {/* WhatsApp Header */}
          <div className="wa-header">
            <svg
              className="wa-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>

            <div className="wa-avatar">NM</div>

            <div className="wa-chat-info">
              <span className="wa-chat-name">NewsMint</span>

              <span className="wa-chat-status">{content.bot}</span>
            </div>

            <div className="wa-header-actions">
              <svg
                className="wa-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 10l5 5-5 5" />
                <path d="M4 4v7a4 4 0 0 0 4 4h12" />
              </svg>

              <svg
                className="wa-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>

              <svg
                className="wa-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </div>
          </div>

          {/* Chat */}
          <div className="wa-body">
            {/* Date */}
            <div className="wa-date">
              <span>{content.today}</span>
            </div>

            {/* Digest Content */}
            <div
              className={`preview-content ${
                contentChanging ? "preview-content--changing" : ""
              }`}
            >
              {/* Greeting */}
              <div className="wa-bubble wa-bubble--text preview-message">
                <p>{content.greeting}</p>
              </div>

              {/* Audio */}
              <div className="wa-bubble wa-bubble--audio preview-message">
                <div className="audio-player">
                  <div className="audio-play-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>

                  <div className="audio-wave">
                    {[8, 14, 10, 16, 12, 8, 6, 10, 4, 8, 6, 4].map(
                      (height, index) => (
                        <div
                          key={index}
                          className={`audio-bar ${
                            index < 5 ? "audio-bar--active" : ""
                          }`}
                          style={{
                            height: `${height}px`,
                          }}
                        />
                      ),
                    )}
                  </div>

                  <span className="audio-time">{content.audioDuration}</span>
                </div>
              </div>

              {/* News Cards */}
              {content.news.map((item, index) => (
                <div
                  key={`${language}-${index}`}
                  className="wa-bubble wa-bubble--card preview-message"
                >
                  <h4>{item.title}</h4>

                  <p>{item.body}</p>
                </div>
              ))}

              {/* Preferences */}
              <div className="wa-bubble wa-bubble--text preference-preview">
                <p className="preference-title">
                  <strong>{content.preferencesTitle}</strong>
                </p>

                <p className="preference-row">
                  <span>{content.language}:</span>{" "}
                  <AnimatedValue>
                    {language === "Hindi" ? "हिंदी" : "English"}
                  </AnimatedValue>
                </p>

                <p className="preference-row">
                  <span>{content.categories}:</span>{" "}
                  <AnimatedValue>
                    {categories.length > 0
                      ? categories.join(", ")
                      : content.noCategories}
                  </AnimatedValue>
                </p>

                <p className="preference-row">
                  <span>{content.whatsapp}:</span>{" "}
                  <AnimatedValue>
                    +91 {phoneNumber || "Not provided"}
                  </AnimatedValue>
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="wa-timestamp">
              <AnimatedValue>{timestamp}</AnimatedValue>

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34b7f1"
                strokeWidth="2"
              >
                <path d="M18 6L7 17l-5-5" />
                <path d="M22 10l-7 7-3-3" />
              </svg>
            </div>
          </div>

          {/* Input */}
          <div className="wa-input-bar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>

            <div className="wa-input-placeholder">{content.message}</div>

            <div className="wa-mic-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
