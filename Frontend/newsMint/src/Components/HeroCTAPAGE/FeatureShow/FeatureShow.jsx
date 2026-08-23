import React from "react";
import "./FeatureShow.css";

const features = [
  {
    id: 1,
    title: "AI-Powered News Summaries",
    description:
      "Intelligent algorithms distill complex stories into easy-to-read highlights.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2v7" />
        <path d="M12 13a5 5 0 0 0 3.5-8.5" />
        <path d="M12 13a5 5 0 0 1-3.5-8.5" />
        <path d="M15 13a3 3 0 0 0 2.1-5.1" />
        <path d="M9 13a3 3 0 0 1-2.1-5.1" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Personalized News Feed",
    description:
      "Tailored content that aligns directly with your unique interests and preferences.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Choose Your Categories",
    description:
      "Select specific topics like Tech, Politics, Business, or Entertainment.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Multiple News Sources",
    description:
      "Aggregates information from various trusted outlets for a balanced view.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Hindi & English Support",
    description:
      "Access your news briefings in either English or Hindi seamlessly.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Smart Duplicate Filtering",
    description:
      "Removes redundant stories so you never read the same news twice.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    id: 7,
    title: "Daily WhatsApp Delivery",
    description:
      "Get your briefing delivered directly to the app you already use every day.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
  {
    id: 8,
    title: "Your Preferred Delivery Time",
    description: "Set the exact hour you want to receive your news updates.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const FeatureShow = () => {
  return (
    <section className="nm-features" id="features">
      <div className="nm-features__container">
        <span className="nm-features__eyebrow">KEY CAPABILITIES</span>

        <h2 className="nm-features__title">
          Everything you need to stay informed
        </h2>

        <div className="nm-features__grid">
          {features.map((feature, index) => (
            <article className="nm-features__card" key={feature.id}>
              <div className="nm-features__card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="nm-features__icon">{feature.icon}</div>

              <div className="nm-features__content">
                <h3 className="nm-features__card-title">{feature.title}</h3>

                <p className="nm-features__card-description">
                  {feature.description}
                </p>
              </div>

              <span className="nm-features__arrow">→</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShow;
