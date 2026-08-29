import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="not-found">
      {/* Background Decoration */}
      <div className="not-found__bg-circle not-found__bg-circle--one" />
      <div className="not-found__bg-circle not-found__bg-circle--two" />

      <div className="not-found__container">
        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="not-found__brand">
          <div className="not-found__brand-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22V5.5Z" />
              <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22V5.5Z" />
              <path d="M6 7h2.5" />
              <path d="M15.5 7H18" />
              <path d="M6 10h2.5" />
              <path d="M15.5 10H18" />
            </svg>
          </div>

          <span>NewsMint</span>
        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="not-found__content">
          <div className="not-found__left">
            <span className="not-found__eyebrow">PAGE NOT FOUND</span>

            <h1>
              Oops! Page
              <br />
              <span>Not Found.</span>
            </h1>

            <div className="not-found__underline" />

            <p className="not-found__description">
              The page you're looking for doesn't exist
              <br className="not-found__desktop-break" />
              or has been moved to another place.
            </p>

            {/* Helpful Card */}
            <div className="not-found__help-card">
              <div className="not-found__help-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1.3 1.3-1.5 2.5h-4c-.2-1.2-.7-1.9-1.5-2.5Z" />
                </svg>
              </div>

              <div className="not-found__help-content">
                <h2>What can you do?</h2>

                <p>
                  Go back, explore our features, or head
                  <br className="not-found__desktop-break" />
                  to the homepage.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="not-found__actions">
              <button
                type="button"
                className="not-found__primary"
                onClick={() => navigate("/")}
              >
                <span>Go to Homepage</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5.5 10.5V21h13V10.5" />
                  <path d="M9.5 21v-6h5v6" />
                </svg>
              </button>

              <button
                type="button"
                className="not-found__secondary"
                onClick={() => navigate(-1)}
              >
                <span>Go Back</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ==================================================
              404 VISUAL
          ================================================== */}

          <div className="not-found__visual">
            <div className="not-found__visual-card">
              {/* Decorative stars */}
              <span className="not-found__star not-found__star--one">✦</span>

              <span className="not-found__star not-found__star--two">✦</span>

              <span className="not-found__circle-decoration">○</span>

              {/* 404 */}
              <div className="not-found__number">
                <span>4</span>
                <span className="not-found__number--gold">0</span>
                <span>4</span>
              </div>

              {/* Newspaper */}
              <div className="not-found__newspaper">
                <div className="not-found__paper">
                  <div className="not-found__paper-image">
                    <div className="not-found__paper-sun" />

                    <div className="not-found__paper-mountain not-found__paper-mountain--one" />
                    <div className="not-found__paper-mountain not-found__paper-mountain--two" />
                  </div>

                  <div className="not-found__paper-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="not-found__paper-bottom">
                    <span />
                    <span />
                  </div>
                </div>

                <div className="not-found__paper-back" />
              </div>

              {/* Yellow Ground */}
              <div className="not-found__ground" />

              {/* Paper Plane */}
              <div className="not-found__plane">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M43 5 4 20.5l15.5 5.5L25 42 43 5Z"
                    fill="currentColor"
                  />
                  <path
                    d="M19.5 26 43 5 25 42l-5.5-16Z"
                    fill="currentColor"
                    opacity=".7"
                  />
                  <path
                    d="M4 20.5 43 5 19.5 26 4 20.5Z"
                    fill="currentColor"
                    opacity=".35"
                  />
                </svg>
              </div>

              {/* Plane Trail */}
              <div className="not-found__trail" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="not-found__footer">
          <span className="not-found__footer-dot" />
          <span>Stay informed. Stay ahead.</span>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
