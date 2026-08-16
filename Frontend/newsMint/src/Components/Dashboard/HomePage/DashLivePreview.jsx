import React from "react";
import "./style/DashLivePreview.css";

const DashLivePreview = ({
  time = "7:30",
  tags = ["Tech", "Rajasthan"],
  heading = "नमस्कार जयेश। आज की मुख्य खबरें:",
  bulletPoints = [
    "राजस्थान का नया एआई रिसर्च पार्क: जयपुर में 500 करोड़ रुपये की लागत से नया तकनीकी केंद्र स्थापित किया जाएगा।",
    "डेटा प्राइवेसी पर नया बिल: टेक कंपनियों के लिए नए नियम अगले महीने से लागू होंगे।",
  ],
  audioDuration = "0:20",
  timestamp = "7:30 AM",
}) => {
  const waveBars = [10, 6, 14, 8, 16, 12, 10, 6, 14, 8, 12, 6, 10, 8, 6, 4];

  return (
    <div className="dash-live-preview">
      {/* Label */}
      <div className="dash-live-preview__label">
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>Live Preview</span>
      </div>

      {/* Phone Frame */}
      <div className="dash-phone">
        <div className="dash-phone__screen">
          {/* Status Bar */}
          <div className="dash-phone__status">
            <span className="dash-phone__time">{time}</span>
            <div className="dash-phone__icons">
              <svg className="dash-phone__icon" viewBox="0 0 24 24" fill="#333">
                <path d="M1 18h2v-6H1v6zm4 0h2V8H5v10zm4 0h2v-8H9v8zm4 0h2v-4h-2v4zm4-8v4h2v-4h-2z" />
              </svg>
              <svg className="dash-phone__icon" viewBox="0 0 24 24" fill="#333">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <svg
                className="dash-phone__battery"
                viewBox="0 0 24 12"
                fill="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="20"
                  height="10"
                  rx="3"
                  stroke="#333"
                  strokeWidth="2"
                />
                <rect x="3" y="3" width="14" height="6" rx="1.5" fill="#333" />
              </svg>
            </div>
          </div>

          {/* Chat Body */}
          <div className="dash-phone__body">
            {/* Date */}
            <div className="dash-phone__date">
              <span>TODAY</span>
            </div>

            {/* Message Bubble */}
            <div className="dash-phone__bubble">
              {/* Tags */}
              <div className="dash-phone__tags">
                {tags.map((tag) => (
                  <span key={tag} className="dash-phone__tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Heading */}
              <p className="dash-phone__heading">{heading}</p>

              {/* Bullet Points */}
              <ul className="dash-phone__list">
                {bulletPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>

              {/* Audio Player */}
              <div className="dash-phone__audio">
                <div className="dash-phone__audio-play">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="dash-phone__audio-wave">
                  {waveBars.map((h, i) => (
                    <div
                      key={i}
                      className={`dash-phone__audio-bar ${i < 10 ? "dash-phone__audio-bar--active" : ""}`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <span className="dash-phone__audio-time">{audioDuration}</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="dash-phone__timestamp">
              <span>{timestamp}</span>
              <svg
                width="12"
                height="12"
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

          {/* Input Bar */}
          <div className="dash-phone__input-bar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <div className="dash-phone__input-placeholder">Message...</div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashLivePreview;
