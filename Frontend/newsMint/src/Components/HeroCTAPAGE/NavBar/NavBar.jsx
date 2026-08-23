import React, { useEffect, useState } from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "How it Works", id: "how-it-works" },
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (e, id) => {
    e.preventDefault();

    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="nm-nav">
      <div className="nm-nav__glass">
        {/* Logo */}
        <button
          type="button"
          className="nm-nav__logo"
          onClick={(e) => handleScroll(e, "home")}
          aria-label="Go to NewsMint home"
        >
          <span className="nm-nav__logo-mark">
            <svg
              viewBox="0 0 64 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Left page */}
              <path
                d="M32 46C24 39.5 16 37.5 7 39V7.5C16 5.5 24 7.5 32 14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Right page */}
              <path
                d="M32 46C40 39.5 48 37.5 57 39V7.5C48 5.5 40 7.5 32 14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Center */}
              <path
                d="M32 14V46"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Text lines */}
              <path
                d="M15 19H24"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M15 26H25"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M15 33H22"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M40 19H49"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M40 26H49"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M40 33H47"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span className="nm-nav__logo-text">NewsMint</span>
        </button>

        {/* Desktop Links */}
        <div className="nm-nav__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="nm-nav__link"
              onClick={(e) => handleScroll(e, link.id)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link to="/authantication-page" className="nm-nav__cta">
          Get Started
          <span>→</span>
        </Link>

        {/* Mobile Button */}
        <button
          type="button"
          className={`nm-nav__toggle ${menuOpen ? "nm-nav__toggle--open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`nm-nav__mobile ${menuOpen ? "nm-nav__mobile--open" : ""}`}
      >
        <div className="nm-nav__mobile-inner">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="nm-nav__mobile-link"
              onClick={(e) => handleScroll(e, link.id)}
            >
              {link.label}
              <span>→</span>
            </a>
          ))}

          <Link
            to="/authantication-page"
            className="nm-nav__mobile-cta"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
            <span>→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
