import React from "react";
import "./HeroSection.css";
import {useNavigate} from 'react-router-dom'
const HeroSection = () => {
  const navigate = useNavigate();
  return (
     <section className="hero-section" id="home">
      <div className="hero-section__container">
        {/* Left Content */}
        <div className="hero-section__content">
          <h1 className="hero-section__title">
            Your Daily News,
            <br />
            <span className="hero-section__title--highlight">Simplified.</span>
          </h1>
          <p className="hero-section__description">
            Clear, distraction-free news summaries tailored to your interests.
            Sent directly to WhatsApp when you want them. A free, personal
            project.
          </p>
          <div className="hero-section__buttons">
            <button className="hero-section__btn hero-section__btn--primary" onClick={()=>{navigate('/authentication-page')}} > 
              Get Started for Free
            </button>
            <button className="hero-section__btn hero-section__btn--secondary" onClick={()=>{navigate('/authentication-page')}} >
              View Sample Digest
            </button>
          </div>
        </div>

        {/* Right Content - Mobile Mockup */}
        <div className="hero-section__phone-wrapper">
          <div className="phone-mockup">
            {/* Phone Header */}
            <div className="phone-mockup__header">
              <button className="phone-mockup__back">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="phone-mockup__avatar">N</div>
              <div className="phone-mockup__header-info">
                <span className="phone-mockup__name">NewsMint</span>
                <span className="phone-mockup__status">online</span>
              </div>
            </div>

            {/* Phone Chat Area */}
            <div className="phone-mockup__chat">
              <div className="phone-mockup__date-label">Today</div>

              {/* Daily Digest Card */}
              <div className="phone-mockup__message phone-mockup__message--card">
                <div className="digest-card">
                  <div className="digest-card__label">Daily Digest</div>
                  <div className="digest-card__time">08:00 AM</div>
                </div>
              </div>

              {/* Voice Note */}
              <div className="phone-mockup__message phone-mockup__message--voice">
                <div className="voice-note">
                  <button className="voice-note__play">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                  <div className="voice-note__waveform">
                    <div
                      className="voice-note__bar"
                      style={{ height: "40%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "70%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "50%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "85%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "60%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "90%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "45%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "75%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "55%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "80%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "65%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "95%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "50%" }}
                    ></div>
                    <div
                      className="voice-note__bar"
                      style={{ height: "70%" }}
                    ></div>
                  </div>
                  <span className="voice-note__duration">0:29</span>
                </div>
              </div>
            </div>

            {/* Phone Input Bar */}
            <div className="phone-mockup__input-bar">
              <button className="phone-mockup__input-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>
              <div className="phone-mockup__input-field">
                <span className="phone-mockup__input-placeholder">
                  Message...
                </span>
              </div>
              <button className="phone-mockup__input-icon phone-mockup__input-icon--mic">
                <svg
                  width="20"
                  height="20"
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
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
