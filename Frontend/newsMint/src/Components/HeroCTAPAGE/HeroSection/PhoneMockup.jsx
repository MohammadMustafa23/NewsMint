import "./PhoneMockup.css";

export default function PhoneMockup() {
  const waveHeights = [8, 16, 10, 22, 14, 26, 12, 20, 9, 18, 11, 24, 8, 15];

  return (
    <div className="phone-mockup">
      <div className="phone-header">
        <button className="phone-back" aria-label="Back">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="phone-avatar">N</div>
        <div className="phone-title">
          <span className="phone-name">NewsMint</span>
          <span className="phone-status">online</span>
        </div>
      </div>

      <div className="phone-body">
        <span className="phone-date-pill">Today</span>

        <div className="digest-card">
          <span className="digest-label">Daily Digest</span>
          <span className="digest-time">08:00 AM</span>
        </div>

        <div className="voice-bubble">
          <button className="voice-play" aria-label="Play voice message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <div className="voice-wave" aria-hidden="true">
            {waveHeights.map((h, i) => (
              <span key={i} className="wave-bar" style={{ height: `${h}px` }} />
            ))}
          </div>
          <span className="voice-duration">0:20</span>
        </div>
      </div>

      <div className="phone-footer">
        <div className="phone-input">
          <span className="input-emoji" aria-hidden="true">
            🙂
          </span>
          <span className="input-placeholder">Message...</span>
        </div>
        <button className="phone-mic" aria-label="Record voice message">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>
    </div>
  );
}
