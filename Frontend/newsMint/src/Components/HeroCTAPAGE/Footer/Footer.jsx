import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo */}
        <a href="#" className="footer__logo">
          NewsMint
        </a>

        {/* Copyright */}
        <p className="footer__copyright">
          © 2024 NewsMint. A Free Personal Project.
        </p>

        {/* Links */}
        <ul className="footer__links">
          <li>
            <a href="#privacy" className="footer__link">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#terms" className="footer__link">
              Terms of Service
            </a>
          </li>
          <li>
            <a href="#contact" className="footer__link">
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
