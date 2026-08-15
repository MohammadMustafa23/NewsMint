import React from "react";
import "./style/PrevNavBar.css";

const PrevNavBar = ({
  userName = "Jayesh Sharma",
  userInitials = "JS",
  onLogout,
}) => {
  return (
    <nav className="prev-navbar">
      {/* Logo */}
      <div className="navbar-logo">NewsMint</div>

      {/* Right Side: User Info + Avatar */}
      <div className="navbar-user">
        <div className="navbar-user-info">
          <span className="navbar-user-name">{userName}</span>
          <button className="navbar-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
        <div className="navbar-avatar">{userInitials}</div>
      </div>
    </nav>
  );
};

export default PrevNavBar;
