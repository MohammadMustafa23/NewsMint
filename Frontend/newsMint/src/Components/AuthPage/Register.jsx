import React, { useState } from "react";
import "./style/Register.css";

import { registerUser } from "../../services/auth.service.js";
import SpinLoader from "../../common/SpinLoader.jsx";
import GoogleAuthButton from "./GoogleAuthButton.jsx";

const Register = ({ setPage, setAuthEmail }) => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Handle Input
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Clear server error
    if (serverError) {
      setServerError("");
    }
  };

  // -----------------------------
  // Validate Form
  // -----------------------------
  const validateForm = () => {
    const newErrors = {};

    const userName = formData.userName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // User Name
    if (!userName) {
      newErrors.userName = "User name is required.";
    } else if (userName.length < 2) {
      newErrors.userName = "User name must be at least 2 characters.";
    }

    // Email
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    // Password
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword.length < 6) {
      newErrors.confirmPassword =
        "Confirm password must be at least 6 characters.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Both passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit multiple times
    if (loading) return;

    setServerError("");
    setSuccessMessage("");

    // Frontend validation
    const isValid = validateForm();
    if (!isValid) return;
    setLoading(true);

    try {
      const data = await registerUser({
        userName: formData.userName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });


      // Store email for Verify Email page
      setAuthEmail(formData.email);

      setSuccessMessage(
        data?.message ||
          "Account created successfully. OTP sent to your email.",
      );

      // Small delay so user can see success message
      setTimeout(() => {
        setPage("verify-email");
      }, 700);
    } catch (error) {
      console.error("Register Error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        {/* Header */}
        <div className="register__header">
          <h1 className="register__brand">NewsMint</h1>

          <h2 className="register__title">Join NewsMint</h2>

          <p className="register__subtitle">
            Create an account to access premium briefings.
          </p>
        </div>

        {/* Form Card */}
        <div className="register__card">
          <form className="register__form" onSubmit={handleSubmit} noValidate>
            {/* Server Error */}
            {serverError && (
              <div className="register__message register__message--error">
                {serverError}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="register__message register__message--success">
                {successMessage}
              </div>
            )}

            {/* User Name */}
            <div className="register__field">
              <label htmlFor="userName" className="register__label">
                User Name
              </label>

              <input
                id="userName"
                name="userName"
                type="text"
                className={`register__input ${
                  errors.userName ? "register__input--error" : ""
                }`}
                placeholder="Full Name"
                value={formData.userName}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
              />

              {errors.userName && (
                <span className="register__error">{errors.userName}</span>
              )}
            </div>

            {/* Email */}
            <div className="register__field">
              <label htmlFor="email" className="register__label">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className={`register__input ${
                  errors.email ? "register__input--error" : ""
                }`}
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />

              {errors.email && (
                <span className="register__error">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="register__field">
              <label htmlFor="password" className="register__label">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                className={`register__input ${
                  errors.password ? "register__input--error" : ""
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              {errors.password && (
                <span className="register__error">{errors.password}</span>
              )}
            </div>
            {/* Confirm Password */}
            <div className="register__field">
              <label htmlFor="confirmPassword" className="register__label">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`register__input ${
                  errors.confirmPassword ? "register__input--error" : ""
                }`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              {errors.confirmPassword && (
                <span className="register__error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* OTP Note */}
            <p className="register__note">
              <strong>Note:</strong> You will receive an OTP to verify your
              email address.
            </p>

            {/* Create Account */}
            <button
              type="submit"
              className="register__btn register__btn--primary"
              disabled={loading}
            >
              {loading ? <SpinLoader size="small" /> : "Create Account"}
            </button>

            {/* Divider */}
            <div className="register__divider">
              <span className="register__divider-text">or</span>
            </div>

            {/* Google */}
            <GoogleAuthButton />
          </form>
        </div>

        {/* Footer */}
        <p className="register__footer">
          Already have an account?{" "}
          <a
            type="button"
            className="register__link"
            onClick={() => setPage("login")}
            disabled={loading}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
