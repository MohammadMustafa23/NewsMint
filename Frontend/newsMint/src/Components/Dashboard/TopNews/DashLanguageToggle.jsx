import React, { useState } from "react";
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
  const [active, setActive] = useState(selected);

  const handleClick = (code) => {
    setActive(code);
    onChange?.(code);
  };

  return (
    <div className="dash-language-toggle">
      <span className="dash-language-toggle__label">{label}</span>
      <div className="dash-language-toggle__group">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`dash-language-toggle__btn ${active === lang.code ? "dash-language-toggle__btn--active" : ""}`}
            onClick={() => handleClick(lang.code)}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.code}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashLanguageToggle;
