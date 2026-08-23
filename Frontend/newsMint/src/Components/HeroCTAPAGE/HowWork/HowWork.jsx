import React from 'react';
import './HowWork.css';

const steps = [
  {
    id: 1,
    title: 'Choose Topics',
    description: "Select what matters to you. Politics, Tech, Local news—it's your choice",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <polyline points="3 6 4 7 3 8" />
        <polyline points="3 12 4 13 3 14" />
        <polyline points="3 18 4 19 3 20" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Set Time',
    description: 'Morning coffee? Evening commute? Pick the exact time you want your daily news.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'AI Summarizes',
    description: 'Our AI scans trusted sources to create a short, factual summary.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
        <path d="M9 21h6" />
        <circle cx="12" cy="9" r="2" />
        <path d="M12 11v2" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Get WhatsApped',
    description: 'Receive a clean, formatted text and an optional voice note right in your chat list.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
];

const HowWork = () => {
  return (
    <section className="newsmint-process" id="how-it-works" >
      <div className="newsmint-process__container">
        <span className="newsmint-process__label">THE PROCESS</span>
        <h2 className="newsmint-process__title">How NewsMint Works</h2>

        <div className="newsmint-process__steps">
          {steps.map((step, index) => (
            <div className="newsmint-process__step" key={step.id}>
              <div className="newsmint-process__icon-wrapper">
                <div className="newsmint-process__icon-box">
                  <span className="newsmint-process__icon">{step.icon}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="newsmint-process__connector" />
                )}
              </div>
              <div className="newsmint-process__content">
                <h3 className="newsmint-process__step-title">
                  <span className="newsmint-process__step-number">{step.id}.</span>{' '}
                  {step.title}
                </h3>
                <p className="newsmint-process__step-description">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWork;