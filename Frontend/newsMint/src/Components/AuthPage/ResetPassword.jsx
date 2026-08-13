import React, { useState } from "react";
import "./style/ResetPassword.css";

const ResetPassword = ({setPage}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Password reset submitted");
  };

  return (
    <div className="reset-password">
      <div className="reset-password__container">
        {/* Brand */}
        <h1 className="reset-password__brand">NewsMint</h1>

        {/* Card */}
        <div className="reset-password__card">
          {/* Header */}
          <div className="reset-password__header">
            <h2 className="reset-password__title">Set New Password</h2>
            <p className="reset-password__subtitle">
              Create a strong password for your account.
            </p>
          </div>

          {/* Form */}
          <form className="reset-password__form" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="reset-password__field">
              <label htmlFor="new-password" className="reset-password__label">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="reset-password__input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="reset-password__field">
              <label
                htmlFor="confirm-password"
                className="reset-password__label"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="reset-password__input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="reset-password__btn">
              Reset Password
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="reset-password__footer">
          Remember your password?{" "}
          <a className="reset-password__link" onClick={()=>{setPage('login')}}> 
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
