import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GoogleAuthButton from "./GoogleAuthButton.jsx";
import "./style/Login.css";
import { getMyPreferences } from "../../services/prefrence.service.js";
import SpinLoader from "../../common/SpinLoader.jsx";
import { loginUser } from "../../services/auth.service.js";

const Login = ({ setPage }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // --------------------------------
  // Handle Input
  // --------------------------------
  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // --------------------------------
  // Validate Form
  // --------------------------------
  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors({
      email: newErrors.email || "",
      password: newErrors.password || "",
    });

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------
  // Login
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const data = await loginUser(payload);

      if (!data?.success) {
        toast.error(data?.message || "Unable to sign in. Please try again.");
        return;
      }

      toast.success(`Welcome Back ${data.userName}`);

      // Check user's preferences
      const preferenceData = await getMyPreferences();

      if (preferenceData?.hasPreferences) {
        // Existing user
        navigate("/home-page", {
          replace: true,
        });
      } else {
        // First-time user
        navigate("/preference", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);

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
    <div className="login">
      <div className="login__container">
        {/* Header */}
        <div className="login__header">
          <h1 className="login__brand">NewsMint</h1>

          <h2 className="login__title">Welcome Back</h2>

          <p className="login__subtitle">
            Enter your details to access your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="login__card">
          <form className="login__form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="login__field">
              <label htmlFor="email" className="login__label">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                className={`login__input ${
                  errors.email ? "login__input--error" : ""
                }`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />

              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="login__field">
              <div className="login__label-row">
                <label htmlFor="password" className="login__label">
                  Password
                </label>

                <a
                  type="button"
                  className="login__forgot"
                  onClick={() => setPage("forgot-password")}
                  disabled={loading}
                >
                  Forgot Password?
                </a>
              </div>

              <input
                id="password"
                type="password"
                name="password"
                className={`login__input ${
                  errors.password ? "login__input--error" : ""
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />

              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login__btn login__btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinLoader size="small" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="login__divider">
              <span className="login__divider-text">or</span>
            </div>

            <GoogleAuthButton />
          </form>
        </div>

        {/* Footer */}
        <p className="login__footer">
          Don&apos;t have an account?{" "}
          <a
            type="button"
            className="login__link"
            onClick={() => setPage("register")}
            disabled={loading}
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
