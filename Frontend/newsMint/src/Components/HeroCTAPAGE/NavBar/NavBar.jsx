import React, { useState } from 'react';
import './NavBar.css';
import {Link } from 'react-router-dom';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <a href="#" className="navbar__logo">
          NewsMint
        </a>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link to="/authantication-page" className="navbar__cta">
          Get Started
        </Link>

        {/* Hamburger Menu (Mobile) */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/authantication-page" className="navbar__mobile-cta" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;