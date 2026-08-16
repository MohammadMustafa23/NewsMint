import React from 'react';
import './style/DashSourceGrid.css';

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ArticleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DashSourceGrid = ({
  sources = [
    {
      id: 'financial-times',
      name: 'Financial Times',
      initials: 'FT',
      tags: ['Finance', 'Global'],
      description: "One of the world's leading news organizations, recognized internationally for its authority, integrit...",
      articleCount: '~40/day',
      isAdded: true,
      isVerified: true,
    },
    {
      id: 'techcrunch',
      name: 'TechCrunch',
      initials: 'TC',
      tags: ['Startups', 'Tech'],
      description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
      articleCount: '~25/day',
      isAdded: false,
      isVerified: true,
    },
    {
      id: 'the-ken',
      name: 'The Ken',
      initials: 'TK',
      tags: ['Business', 'India'],
      description: 'Pioneering subscription-only journalism in India. Deeply reported, analytical business stories.',
      articleCount: '1/day',
      isAdded: true,
      isVerified: true,
    },
    {
      id: 'economic-times',
      name: 'Economic Times',
      initials: 'ET',
      tags: ['Markets', 'India'],
      description: 'Daily newspaper covering the Indian economy, international finance, share prices, and commodit...',
      articleCount: '~30/day',
      isAdded: false,
      isVerified: false,
    },
    {
      id: 'reuters',
      name: 'Reuters',
      initials: 'R',
      tags: ['News', 'Global'],
      description: 'Breaking news, business, financial and investing articles from around the globe. Highly objective...',
      articleCount: '~200/day',
      isAdded: false,
      isVerified: true,
    },
  ],
  sectionLabel = 'All Sources (A-Z)',
  loadMoreText = 'Load More Sources',
  onToggleSource,
  onLoadMore,
}) => {
  return (
    <div className="dash-source-grid">
      {/* Section Label */}
      <div className="dash-source-grid__label">{sectionLabel}</div>

      {/* Cards Grid */}
      <div className="dash-source-grid__cards">
        {sources.map((source) => (
          <div key={source.id} className="dash-source-card">
            {/* Header: Logo + Name + Tags */}
            <div className="dash-source-card__header">
              <div className="dash-source-card__logo">{source.initials}</div>
              <div className="dash-source-card__info">
                <div className="dash-source-card__name-row">
                  <span className="dash-source-card__name">{source.name}</span>
                  {source.isVerified && <VerifiedIcon />}
                </div>
                <div className="dash-source-card__tags">
                  {source.tags.map((tag, idx) => (
                    <React.Fragment key={tag}>
                      <span className="dash-source-card__tag">{tag}</span>
                      {idx < source.tags.length - 1 && (
                        <span className="dash-source-card__tag-sep">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="dash-source-card__desc">{source.description}</p>

            {/* Footer: Count + Button */}
            <div className="dash-source-card__footer">
              <div className="dash-source-card__count">
                <ArticleIcon />
                <span>{source.articleCount}</span>
              </div>
              <button
                type="button"
                className={`dash-source-card__btn ${source.isAdded ? 'dash-source-card__btn--added' : ''}`}
                onClick={() => onToggleSource?.(source.id, !source.isAdded)}
              >
                {source.isAdded ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <span className="dash-source-card__btn-plus">+</span> Add
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="dash-source-grid__load-more">
        <button type="button" className="dash-source-grid__load-btn" onClick={onLoadMore}>
          {loadMoreText}
        </button>
      </div>
    </div>
  );
};

export default DashSourceGrid;