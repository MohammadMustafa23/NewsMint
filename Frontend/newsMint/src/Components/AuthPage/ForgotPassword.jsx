import React, { useState } from "react";
import { toast } from "sonner";

import "./style/ForgotPassword.css";

import SpinLoader from "../../common/SpinLoader.jsx";
import { forgetPassword } from "../../services/auth.service.js";

const ForgotPassword = ({ setPage, setAuthEmail }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------
  // Handle Email Change
  // --------------------------------
  const handleChange = (e) => {
    setEmail(e.target.value);

    if (error) {
      setError("");
    }
  };

  // --------------------------------
  // Validate Email
  // --------------------------------
  const validateEmail = () => {
    const value = email.trim();

    if (!value) {
      setError("Email is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // --------------------------------
  // Submit
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!validateEmail()) return;
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      const data = await forgetPassword({
        email: normalizedEmail,
      });

      console.log("Forgot Password Response:", data);

      if (!data?.success) {
        toast.error(
          data?.message || "Unable to process your request. Please try again.",
        );
        return;
      }

      // Save email for OTP verification
      setAuthEmail(normalizedEmail);

      toast.success(data?.message || "OTP has been sent to your email.");

      // Move to forgot-password OTP page
      setPage("verify-forgot-password");

    } catch (error) {
      console.error("Forgot Password Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
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
              Enter your email address and we&apos;ll send you a verification
              code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form
            className="forgot-password__form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="forgot-password__field">
              <label htmlFor="email" className="forgot-password__label">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                className={`forgot-password__input ${
                  error ? "forgot-password__input--error" : ""
                }`}
                placeholder="name@example.com"
                value={email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />

              {error && <span className="forgot-password__error">{error}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="forgot-password__btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinLoader size="small" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="forgot-password__footer">
          Remember your password?{" "}
          <a
            type="button"
            onClick={() => setPage("login")}
            className="forgot-password__link"
            disabled={loading}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
