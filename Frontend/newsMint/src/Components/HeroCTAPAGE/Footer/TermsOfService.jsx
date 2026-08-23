import React from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

const TermsOfService = () => {
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        {/* Header */}
        <header className="legal-page__header">
          <Link to="/" className="legal-page__brand">
            NewsMint
          </Link>

          <span className="legal-page__badge">Terms of Service</span>

          <h1 className="legal-page__title">Terms of Service</h1>

          <p className="legal-page__intro">
            These terms explain the basic rules for using NewsMint. By using the
            service, you agree to use it responsibly and in accordance with
            these terms.
          </p>

          <p className="legal-page__updated">Last updated: August 23, 2026</p>
        </header>

        {/* Content */}
        <article className="legal-page__content">
          <section className="legal-section">
            <span className="legal-section__number">01</span>

            <div>
              <h2>About NewsMint</h2>

              <p>
                NewsMint is a personal news aggregation and summarization
                project designed to help users stay informed through
                personalized news digests.
              </p>

              <p>
                NewsMint may collect news from different sources, process the
                information, and present summarized content according to user
                preferences.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">02</span>

            <div>
              <h2>Using NewsMint</h2>

              <p>
                You agree to use NewsMint only for lawful purposes and in a way
                that does not interfere with the operation or security of the
                service.
              </p>

              <p>You must not:</p>

              <ul>
                <li>Attempt to gain unauthorized access to the service.</li>
                <li>Abuse, overload, or disrupt NewsMint systems.</li>
                <li>Use the service for unlawful activities.</li>
                <li>Attempt to access another user's account.</li>
                <li>Use automated methods to abuse or attack the service.</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">03</span>

            <div>
              <h2>User Accounts</h2>

              <p>
                Some NewsMint features may require an account. You are
                responsible for maintaining the security of your account
                credentials.
              </p>

              <p>
                You should notify us if you believe your account has been
                accessed without authorization.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">04</span>

            <div>
              <h2>News & AI Summaries</h2>

              <p>
                NewsMint may use automated or AI-powered systems to summarize
                and organize news content.
              </p>

              <p>
                Summaries are provided for informational purposes and may
                contain mistakes, omissions, or inaccuracies. Users should refer
                to the original publisher when they need complete or
                authoritative information.
              </p>

              <p>
                NewsMint does not guarantee that every summary is complete,
                accurate, current, or suitable for a particular purpose.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">05</span>

            <div>
              <h2>Third-Party Content</h2>

              <p>
                NewsMint may display or summarize information originating from
                third-party publishers, feeds, APIs, or other external sources.
              </p>

              <p>
                NewsMint does not own third-party content and is not responsible
                for the accuracy, availability, or policies of external
                publishers.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">06</span>

            <div>
              <h2>Intellectual Property</h2>

              <p>
                The NewsMint application, branding, original design, source
                code, and original project materials are protected by applicable
                intellectual property laws, except where otherwise stated.
              </p>

              <p>
                Third-party content remains the property of its respective
                owners.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">07</span>

            <div>
              <h2>Availability</h2>

              <p>
                NewsMint is provided as a personal project and may occasionally
                be unavailable due to maintenance, technical problems,
                third-party service outages, or other circumstances.
              </p>

              <p>
                We do not guarantee uninterrupted or error-free availability of
                the service.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">08</span>

            <div>
              <h2>Disclaimer</h2>

              <p>
                NewsMint is provided on an "as is" and "as available" basis to
                the extent permitted by applicable law.
              </p>

              <p>
                NewsMint is not a substitute for professional, legal, financial,
                medical, or other specialized advice.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">09</span>

            <div>
              <h2>Limitation of Liability</h2>

              <p>
                To the extent permitted by applicable law, NewsMint and its
                contributors will not be responsible for losses arising from
                reliance on news summaries, temporary service interruptions,
                third-party services, or information obtained through the
                platform.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">10</span>

            <div>
              <h2>Changes to These Terms</h2>

              <p>
                These Terms of Service may be updated as NewsMint evolves.
                Changes will be reflected on this page, together with an updated
                date.
              </p>
            </div>
          </section>

          <section className="legal-section legal-section--last">
            <span className="legal-section__number">11</span>

            <div>
              <h2>Contact</h2>

              <p>
                If you have questions about these Terms of Service, you can
                contact us through the NewsMint GitHub project.
              </p>

              <a
                href="https://github.com/MohammadMustafa23/NewsMint"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-github-link"
              >
                Visit NewsMint on GitHub →
              </a>
            </div>
          </section>
        </article>

        {/* Bottom */}
        <footer className="legal-page__footer">
          <Link to="/">← Back to NewsMint</Link>

          <span>© 2026 NewsMint</span>
        </footer>
      </div>
    </main>
  );
};

export default TermsOfService;
