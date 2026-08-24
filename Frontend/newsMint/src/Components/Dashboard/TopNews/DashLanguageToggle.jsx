import React from "react";
import "./style/DashLanguageToggle.css";

const LANGUAGES = [
  { code: "ENG", label: "English" },
  { code: "HIN", label: "Hindi" },
];

const DashLanguageToggle = ({
  label = "Select Language",
  selected = "ENG",
  onChange,
}) => {
  const handleClick = (code) => {
    if (code === selected) return;

    onChange?.(code);
  };

  return (
    <div className="dash-language-toggle">
      <span className="dash-language-toggle__label">{label}</span>

      <div
        className="dash-language-toggle__group"
        role="group"
        aria-label={label}
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`dash-language-toggle__btn ${
              selected === lang.code ? "dash-language-toggle__btn--active" : ""
            }`}
            onClick={() => handleClick(lang.code)}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={selected === lang.code}
          >
            {lang.code}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashLanguageToggle;
