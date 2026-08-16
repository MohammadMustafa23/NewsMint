import React, { useState } from "react";
import "./style/DashStatusBar.css";

const DashStatusBar = ({
  nextDigestTime = "in 4h 12m",
  isDeliveryActive = true,
  readStreak = 12,
  isPaused = false,
  onPauseToggle,
}) => {
  const [paused, setPaused] = useState(isPaused);

  const handleToggle = () => {
    const next = !paused;
    setPaused(next);
    onPauseToggle?.(next);
  };

  return (
    <div className="dash-status-bar">
      <div className="dash-status-bar__left">
        {/* Next Digest */}
        <div className="dash-status-bar__item">
          <span className="dash-status-bar__label">Next Digest</span>
          <span className="dash-status-bar__value">{nextDigestTime}</span>
        </div>

        {/* Delivery Status */}
        <div className="dash-status-bar__badge dash-status-bar__badge--success">
          <span className="dash-status-bar__dot" />
          <span>Delivery active</span>
        </div>

        {/* Read Streak */}
        <div className="dash-status-bar__badge dash-status-bar__badge--fire">
          <span className="dash-status-bar__fire">🔥</span>
          <span>{readStreak}-day read streak</span>
        </div>
      </div>

      {/* Pause Toggle */}
      <div className="dash-status-bar__right">
        <span className="dash-status-bar__pause-label">Pause digest</span>
        <button
          type="button"
          className={`dash-status-bar__toggle ${paused ? "dash-status-bar__toggle--paused" : ""}`}
          onClick={handleToggle}
          aria-label={paused ? "Resume digest" : "Pause digest"}
        >
          <span className="dash-status-bar__toggle-knob" />
        </button>
      </div>
    </div>
  );
};

export default DashStatusBar;
