import React, { useState } from "react";
import "./style/DashNav.css";
import { NavLink, useNavigate } from "react-router-dom";
import ConfirmModal from "../../../common/ConfirmModal";
import { logOutUser } from "../../../services/auth.service";

const NAV_LINKS = [
  {
    id: "digest",
    label: "Digest",
    mobileDescription: "Your personalized news digest",
    path: "/home-page",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2.5" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="10" y2="18" />
        <line x1="14" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    id: "sources",
    label: "Sources",
    mobileDescription: "Manage your news sources",
    path: "/home-page/source",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="11" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    id: "today-top-news",
    label: "Top News",
    mobileDescription: "See today's trending stories",
    path: "/home-page/top-news",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await logOutUser();

      setShowLogoutModal(false);
      setMobileMenuOpen(false);

      navigate("/authentication-page");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    navigate("/home-page");
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileLogoutClick = () => {
    setMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  return (
    <>
      <header className="dash-nav">
        {/* Ambient decorative glow */}
        <div className="dash-nav__ambient dash-nav__ambient--one" />
        <div className="dash-nav__ambient dash-nav__ambient--two" />

        <div className="dash-nav__inner">
          {/* ================= LEFT ================= */}
          <div className="dash-nav__left">
            {/* ================= BRAND ================= */}
            <button
              type="button"
              className="dash-nav__brand"
              onClick={handleLogoClick}
              aria-label={`Go to ${brandName} home`}
            >
              <span className="dash-nav__logo-frame">
                <span className="dash-nav__logo-glow" />

                <img
                  src="/newMintLogo2.0.png"
                  alt={brandName}
                  className="dash-nav__logo-image"
                />
              </span>

              <span className="dash-nav__brand-copy">
                <span className="dash-nav__brand-name">{brandName}</span>

                <span className="dash-nav__brand-tagline">
                  AI-powered news intelligence
                </span>
              </span>
            </button>

            {/* ================= DESKTOP NAV ================= */}
            <nav className="dash-nav__links" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  end={link.id === "digest"}
                  className={({ isActive }) =>
                    `dash-nav__link ${isActive ? "dash-nav__link--active" : ""}`
                  }
                >
                  <span className="dash-nav__link-icon">{link.icon}</span>

                  <span className="dash-nav__link-label">{link.label}</span>

                  <span className="dash-nav__active-indicator" />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="dash-nav__right">
            {/* ================= USER ================= */}
            <div className="dash-nav__user" title={`Signed in as ${userName}`}>
              <div className="dash-nav__avatar">
                <span>{userInitials}</span>
              </div>

              <div className="dash-nav__user-info">
                <span className="dash-nav__user-label">Welcome back</span>

                <span className="dash-nav__user-name">{userName}</span>
              </div>
            </div>

            {/* ================= DESKTOP LOGOUT ================= */}
            <button
              type="button"
              className="dash-nav__logout"
              onClick={() => setShowLogoutModal(true)}
            >
              <span className="dash-nav__logout-icon">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>

              <span>Log out</span>
            </button>

            {/* ================= MOBILE MENU BUTTON ================= */}
            <button
              type="button"
              className={`dash-nav__menu-toggle ${
                mobileMenuOpen ? "dash-nav__menu-toggle--open" : ""
              }`}
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        <div
          className={`dash-nav__mobile-menu ${
            mobileMenuOpen ? "dash-nav__mobile-menu--open" : ""
          }`}
        >
          <div className="dash-nav__mobile-menu-inner">
            <div className="dash-nav__mobile-heading">
              <span>Navigation</span>
              <span className="dash-nav__mobile-heading-line" />
            </div>

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
                onClick={handleMobileLinkClick}
              >
                <span className="dash-nav__mobile-icon">{link.icon}</span>

                <span className="dash-nav__mobile-copy">
                  <span>{link.label}</span>
                  <small>{link.mobileDescription}</small>
                </span>

                <svg
                  className="dash-nav__mobile-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </NavLink>
            ))}

            {/* Mobile logout */}
            <button
              type="button"
              className="dash-nav__mobile-logout"
              onClick={handleMobileLogoutClick}
            >
              <span className="dash-nav__mobile-logout-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>

              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= LOGOUT CONFIRMATION ================= */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => {
          if (!logoutLoading) {
            setShowLogoutModal(false);
          }
        }}
        onConfirm={handleLogout}
        title="Logout from NewsMint?"
        description="You will need to sign in again to access your personalized news digest."
        confirmText="Logout"
        cancelText="Stay Logged In"
        variant="logout"
        loading={logoutLoading}
      />
    </>
  );
};

export default DashNav;
