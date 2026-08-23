import React from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        {/* Header */}
        <header className="legal-page__header">
          <Link to="/" className="legal-page__brand">
            NewsMint
          </Link>

          <span className="legal-page__badge">Privacy Policy</span>

          <h1 className="legal-page__title">Privacy Policy</h1>

          <p className="legal-page__intro">
            Your privacy matters to us. This Privacy Policy explains what
            information NewsMint may collect, how it is used, and how we protect
            it.
          </p>

          <p className="legal-page__updated">Last updated: August 23, 2026</p>
        </header>

        {/* Content */}
        <article className="legal-page__content">
          <section className="legal-section">
            <span className="legal-section__number">01</span>

            <div>
              <h2>Information We Collect</h2>

              <p>
                When you use NewsMint, we may collect information necessary to
                provide and improve the service.
              </p>

              <h3>Account Information</h3>

              <ul>
                <li>Name or username</li>
                <li>Email address</li>
                <li>Authentication information</li>
              </ul>

              <h3>News Preferences</h3>

              <ul>
                <li>Selected news categories</li>
                <li>Preferred language</li>
                <li>Preferred delivery time</li>
                <li>News source preferences</li>
              </ul>

              <h3>Technical Information</h3>

              <p>
                We may collect limited technical information required for
                authentication, security, debugging, and reliable operation of
                the service.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">02</span>

            <div>
              <h2>How We Use Your Information</h2>

              <p>Information collected through NewsMint may be used to:</p>

              <ul>
                <li>Create and manage your account.</li>
                <li>Remember your news preferences.</li>
                <li>Generate personalized news digests.</li>
                <li>Deliver news according to your selected preferences.</li>
                <li>Maintain and improve NewsMint.</li>
                <li>
                  Protect the service against misuse and unauthorized access.
                </li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">03</span>

            <div>
              <h2>News Content</h2>

              <p>
                NewsMint may obtain news information from external news sources,
                feeds, or APIs. News content belongs to its respective
                publishers and content owners.
              </p>

              <p>
                NewsMint may process publicly available news information to
                create summaries and personalized digests. We do not claim
                ownership of third-party news content.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">04</span>

            <div>
              <h2>Third-Party Services</h2>

              <p>
                NewsMint may use third-party services to provide authentication,
                data storage, news retrieval, AI-powered processing, messaging,
                hosting, or other technical functionality.
              </p>

              <p>
                These services may process information according to their own
                privacy policies and terms.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">05</span>

            <div>
              <h2>Data Security</h2>

              <p>
                We take reasonable measures to protect information associated
                with NewsMint from unauthorized access, alteration, disclosure,
                or destruction.
              </p>

              <p>
                However, no internet-based service can guarantee absolute
                security.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">06</span>

            <div>
              <h2>Data Retention</h2>

              <p>
                We retain account and preference information for as long as
                reasonably necessary to operate the service, maintain security,
                comply with applicable obligations, or resolve disputes.
              </p>

              <p>
                If you delete your account, information associated with your
                account may be deleted or anonymized, subject to technical and
                legal requirements.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">07</span>

            <div>
              <h2>Your Choices</h2>

              <p>
                Depending on the features available in your account, you may be
                able to update your profile, change your news preferences, or
                stop using the service.
              </p>

              <p>
                If you have questions about your information or want to request
                assistance regarding your data, you can contact us through the
                project's GitHub repository.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">08</span>

            <div>
              <h2>Children's Privacy</h2>

              <p>
                NewsMint is not specifically designed for children. We do not
                knowingly request personal information from children in
                violation of applicable laws.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <span className="legal-section__number">09</span>

            <div>
              <h2>Changes to This Policy</h2>

              <p>
                This Privacy Policy may be updated when NewsMint's features,
                technology, or practices change. The updated version will be
                published on this page with a revised "Last updated" date.
              </p>
            </div>
          </section>

          <section className="legal-section legal-section--last">
            <span className="legal-section__number">10</span>

            <div>
              <h2>Contact</h2>

              <p>
                If you have questions regarding this Privacy Policy, please
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

export default PrivacyPolicy;
