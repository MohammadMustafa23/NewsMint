import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const GITHUB_URL = "https://github.com/MohammadMustafa23";

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo */}
        <Link to="/" className="footer__logo">
          NewsMint
        </Link>

        {/* Copyright */}
        <p className="footer__copyright">
          © 2026 NewsMint. A Free Personal Project.
        </p>

        {/* Links */}
        <ul className="footer__links">
          <li>
            <Link to="/privacy-policy" className="footer__link">
              Privacy Policy
            </Link>
          </li>

          <li>
            <Link to="/terms-of-service" className="footer__link">
              Terms of Service
            </Link>
          </li>

          <li>
            <a
              href={GITHUB_URL}
              className="footer__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
