// components/common/SpinLoader.jsx

import "./SpinLoader.css";

const SpinLoader = ({ size = "medium", fullscreen = false }) => {
  return (
    <div
      className={`spin-loader-wrapper ${
        fullscreen ? "spin-loader-wrapper--fullscreen" : ""
      }`}
    >
      <span className={`spin-loader spin-loader--${size}`}></span>
    </div>
  );
};

export default SpinLoader;
