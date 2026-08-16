import React, { useState } from "react";
import "./style/DashNav.css";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  {
    id: "digest",
    label: "Digest",
    path: "/home-page",
    icon: (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "sources",
    label: "Sources",
    path: "/home-page/source",
    icon: (
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
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "today-top-news",
    label: "Today Top News",
    path: "/home-page/top-news",
    icon: (
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
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
];

const DashNav = ({
  brandName = "NewsMint",
  userName = "Jayesh",
  userInitials = "JD",
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="dash-nav">
      <div className="dash-nav__inner">
        {/* LEFT: Logo + Desktop Nav */}
        <div className="dash-nav__left">
          {/* Logo */}
          <div className="dash-nav__logo">
            <svg
              className="dash-nav__logo-icon"
              viewBox="0 0 24 24"
              fill="#8B5E1A"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line
                x1="8"
                y1="7"
                x2="16"
                y2="7"
                stroke="#faf8f4"
                strokeWidth="1.5"
              />
              <line
                x1="8"
                y1="11"
                x2="14"
                y2="11"
                stroke="#faf8f4"
                strokeWidth="1.5"
              />
              <line
                x1="8"
                y1="15"
                x2="12"
                y2="15"
                stroke="#faf8f4"
                strokeWidth="1.5"
              />
            </svg>
            <span className="dash-nav__logo-text">{brandName}</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="dash-nav__links">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.id}
                to={link.path}
                end={link.id === "digest"}
                className={({ isActive }) =>
                  `dash-nav__link ${isActive ? "dash-nav__link--active" : ""}`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* RIGHT: User + Logout */}
        <div className="dash-nav__right">
          {/* User Badge */}
          <div className="dash-nav__user">
            <div className="dash-nav__avatar">{userInitials}</div>
            <span className="dash-nav__user-name">{userName}</span>
          </div>

          {/* Logout */}
          <button type="button" className="dash-nav__logout" onClick={onLogout}>
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className={`dash-nav__menu-toggle ${mobileMenuOpen ? "dash-nav__menu-toggle--open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`dash-nav__mobile-menu ${mobileMenuOpen ? "dash-nav__mobile-menu--open" : ""}`}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            end={link.id === "digest"}
            className={({ isActive }) =>
              `dash-nav__mobile-link ${
                isActive ? "dash-nav__mobile-link--active" : ""
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default DashNav;
