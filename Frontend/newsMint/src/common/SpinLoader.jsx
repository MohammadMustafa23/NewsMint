// components/common/SpinLoader.jsx

import "./SpinLoader.css";

const SpinLoader = ({ size = "medium", fullscreen = false }) => {
  return (
    <div
      className={`spin-loader-wrapper ${
        fullscreen ? "spin-loader-wrapper--fullscreen" : ""
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className={`spin-loader spin-loader--${size}`}>
        <span className="spin-loader__orbit">
          <span className="spin-loader__dot" />
        </span>

        <span className="spin-loader__core">N</span>
      </div>

      {fullscreen && <span className="spin-loader__text">Loading...</span>}
    </div>
  );
};

export default SpinLoader;
