import React, { useState } from "react";
import "./style/ForgotPassword.css";

const ForgotPassword = ({setPage}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log("Reset link requested for:", email);
  };

  return (
    <div className="forgot-password">
      <div className="forgot-password__container">
        {/* Brand */}
        <h1 className="forgot-password__brand">NewsMint</h1>

        {/* Card */}
        <div className="forgot-password__card">
          {/* Header */}
          <div className="forgot-password__header">
            <h2 className="forgot-password__title">Forgot Password?</h2>
            <p className="forgot-password__subtitle">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          {/* Form */}
          <form className="forgot-password__form" onSubmit={handleSubmit}>
            <div className="forgot-password__field">
              <label htmlFor="email" className="forgot-password__label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="forgot-password__input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="forgot-password__btn">
              Send Reset Link
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="forgot-password__footer">
          Remember your password?{" "}
          <a onClick={()=>{setPage('login')}} className="forgot-password__link">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
