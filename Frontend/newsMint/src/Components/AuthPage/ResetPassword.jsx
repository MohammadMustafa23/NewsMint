import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import "./style/ResetPassword.css";

import SpinLoader from "../../common/SpinLoader";
import { resetPassword } from "../../services/auth.service";

const ResetPassword = ({ setPage, email, clearAuthSession }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // --------------------------------
  // Check Reset Session
  // --------------------------------
  useEffect(() => {
    if (!email) {
      toast.error("Password reset session expired. Please try again.");
      setPage("forgot-password");
    }
  }, [email, setPage]);

  // --------------------------------
  // Handle Change
  // --------------------------------
  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // --------------------------------
  // Validate
  // --------------------------------
  const validateForm = () => {
    const newErrors = {};

    const password = formData.newPassword;
    const confirmPassword = formData.confirmPassword;

    if (!password) {
      newErrors.newPassword = "New password is required.";
    } else if (password.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors({
      newPassword: newErrors.newPassword || "",
      confirmPassword: newErrors.confirmPassword || "",
    });

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------
  // Submit
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) return;

    // Check reset session
    if (!email) {
      toast.error("Password reset session expired. Please try again.");
      setPage("forgot-password");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(
        {
          email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        })
        
      // --------------------------------
      // API Failed
      // --------------------------------
      if (!data?.success) {
        const message = data?.message || "Unable to reset your password.";

        toast.error(message);

        // If backend tells us the reset session
        // has expired, restart the reset flow.
        if (/expired|invalid.*token|invalid.*session/i.test(message)) {
          clearAuthSession();

          setPage("forgot-password");
        }

        return;
      }

      // --------------------------------
      // Success
      // --------------------------------
      toast.success(data?.message || "Password reset successfully.");

      // Clear temporary reset session
      clearAuthSession();

      // Clear form
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });

      // Go to Login
      setTimeout(() => {
        setPage("login");
      }, 700);
    } catch (error) {
      console.error("Reset Password Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";

      toast.error(message);


      if (error?.response?.status === 401 || error?.response?.status === 403) {
        clearAuthSession();

        setPage("forgot-password");
      }
    } finally {
      setLoading(false);
    }
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
          <form
            className="reset-password__form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* New Password */}
            <div className="reset-password__field">
              <label htmlFor="new-password" className="reset-password__label">
                New Password
              </label>

              <input
                id="new-password"
                name="newPassword"
                type="password"
                className={`reset-password__input ${
                  errors.newPassword ? "reset-password__input--error" : ""
                }`}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              {errors.newPassword && (
                <span className="reset-password__error">
                  {errors.newPassword}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="reset-password__field">
              <label
                htmlFor="confirm-password"
                className="reset-password__label"
              >
                Confirm Password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                className={`reset-password__input ${
                  errors.confirmPassword ? "reset-password__input--error" : ""
                }`}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              {errors.confirmPassword && (
                <span className="reset-password__error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="reset-password__btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinLoader size="small" />
                  <span>Resetting...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="reset-password__footer">
          Remember your password?{" "}
          <a
            type="button"
            className="reset-password__link"
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

export default ResetPassword;
