import React, { useEffect, useRef, useState } from "react";
import "./style/DigestSetupForm.css";
import SpinLoader from "../../common/SpinLoader";
import { connectTelegram } from "../../services/telegram.service";

const CATEGORIES = [
  "India",
  "Technology",
  "Artificial Intelligence",
  "Business",
  "Finance & Markets",
  "World",
  "Science",
  "Space",
  "Cybersecurity",
  "Startups",
  "Education & Careers",
  "Health",
  "Sports",
  "Entertainment",
  "Environment & Climate",
];

const DELIVERY_TIMES = ["07:00 AM (IST)", "07:30 AM (IST)", "08:00 AM (IST)"];

const DigestSetupForm = ({
  userName = "Jayesh",
  phoneNumber = "",
  selectedCategories = [],
  selectedLanguage = "English",
  deliveryTime = "07:30 AM (IST)",
  telegram = {
    chatId: null,
    connected: false,
  },

  onSave,
  onCategoryToggle,
  onLanguageChange,
  onTimeChange,
  onPhoneChange,
  onTelegramConnect,
}) => {
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTelegramConnecting, setIsTelegramConnecting] = useState(false);
  const telegramAbortControllerRef = useRef(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Controls only whether the custom time input is visible.
  // The actual selected time is still stored in deliveryTime.
  const [isCustomTime, setIsCustomTime] = useState(
    deliveryTime !== "" && !DELIVERY_TIMES.includes(deliveryTime),
  );

  /*
   * --------------------------------
   * Validation
   * --------------------------------
   */

  const validateForm = () => {
    const newErrors = {};

    // Categories
    if (!selectedCategories || selectedCategories.length === 0) {
      newErrors.categories = "Please select at least one category.";
    }

    // Language
    if (!selectedLanguage) {
      newErrors.language = "Please select a language.";
    }

    // Delivery time
    if (!deliveryTime) {
      newErrors.deliveryTime = "Please select a delivery time.";
    }

    // Phone
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (!cleanPhone) {
      newErrors.phoneNumber = "WhatsApp number is required.";
    } else if (cleanPhone.length !== 10) {
      newErrors.phoneNumber = "WhatsApp number must contain exactly 10 digits.";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phoneNumber = "Please enter a valid Indian mobile number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * --------------------------------
   * Category
   * --------------------------------
   */

  const toggleCategory = (category) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    onCategoryToggle?.(nextCategories);

    // Clear category error once user selects something
    if (nextCategories.length > 0) {
      setErrors((prev) => ({
        ...prev,
        categories: "",
      }));
    }

    setSubmitSuccess(false);
    setSubmitError("");
  };

  /*
   * --------------------------------
   * Language
   * --------------------------------
   */

  const handleLanguageChange = (language) => {
    onLanguageChange?.(language);

    setErrors((prev) => ({
      ...prev,
      language: "",
    }));

    setSubmitSuccess(false);
    setSubmitError("");
  };

  /*
   * --------------------------------
   * Delivery Time
   * --------------------------------
   */

  const handleTimeChange = (event) => {
    const value = event.target.value;

    // User selected Custom Time
    if (value === "CUSTOM") {
      setIsCustomTime(true);

      setErrors((prev) => ({
        ...prev,
        deliveryTime: "",
      }));

      setSubmitSuccess(false);
      setSubmitError("");

      return;
    }

    // User selected one of the 3 preset times
    setIsCustomTime(false);

    onTimeChange?.(value);

    setErrors((prev) => ({
      ...prev,
      deliveryTime: "",
    }));

    setSubmitSuccess(false);
    setSubmitError("");
  };

  /*
   * --------------------------------
   * Custom Delivery Time
   * --------------------------------
   */

  const handleCustomTimeChange = (event) => {
    const value = event.target.value;

    if (!value) return;

    const [hours, minutes] = value.split(":");
    const hour = Number(hours);

    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    const period = hour >= 12 ? "PM" : "AM";

    const formattedTime = `${String(displayHour).padStart(
      2,
      "0",
    )}:${minutes} ${period} (IST)`;

    onTimeChange?.(formattedTime);

    setErrors((prev) => ({
      ...prev,
      deliveryTime: "",
    }));

    setSubmitSuccess(false);
    setSubmitError("");
  };

  /*
   * --------------------------------
   * Convert saved time to input value
   * --------------------------------
   */

  const getCustomTimeValue = () => {
    if (!deliveryTime) return "";

    const match = deliveryTime.match(/^(\d{2}):(\d{2})/);

    if (!match) return "";

    let hour = Number(match[1]);
    const minutes = match[2];

    // Existing format is already 12-hour based.
    // Convert AM/PM display back to 24-hour format.
    const periodMatch = deliveryTime.match(/\b(AM|PM)\b/i);

    if (periodMatch) {
      const period = periodMatch[1].toUpperCase();

      if (period === "AM") {
        if (hour === 12) {
          hour = 0;
        }
      } else if (period === "PM") {
        if (hour !== 12) {
          hour += 12;
        }
      }
    }

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  };

  /*
   * --------------------------------
   * Phone
   * --------------------------------
   */

  const handlePhoneChange = (event) => {
    // Allow only numbers
    const value = event.target.value.replace(/\D/g, "");

    // Maximum 10 digits
    const limitedValue = value.slice(0, 10);

    onPhoneChange?.(limitedValue);

    setErrors((prev) => ({
      ...prev,
      phoneNumber: "",
    }));

    setSubmitSuccess(false);
    setSubmitError("");
  };

  /*
   * --------------------------------
   * Submit
   * --------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setSubmitError("");
    setSubmitSuccess(false);

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSave?.({
        categories: selectedCategories,
        language: selectedLanguage,
        deliveryTime,
        phoneNumber: phoneNumber.replace(/\D/g, ""),

        telegram: {
          chatId: telegram?.chatId || null,
          connected: telegram?.connected || false,
        },
      });

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Submit Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save your preferences.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * --------------------------------
   * Telegram cleanup
   * --------------------------------
   */

  useEffect(() => {
    return () => {
      telegramAbortControllerRef.current?.abort();
      telegramAbortControllerRef.current = null;
    };
  }, []);

  /*
   * --------------------------------
   * Telegram
   * --------------------------------
   */

  const handleTelegramConnect = async () => {
    if (isTelegramConnecting) return;

    // Cancel any previous connection attempt
    telegramAbortControllerRef.current?.abort();

    // Create a new controller for this connection attempt
    const controller = new AbortController();

    telegramAbortControllerRef.current = controller;

    setIsTelegramConnecting(true);
    setSubmitError("");

    try {
      await connectTelegram({
        signal: controller.signal,

        onConnected: (status) => {
          if (controller.signal.aborted) return;

          onTelegramConnect?.({
            chatId: status?.telegram?.chatId || null,
            connected: true,
          });

          setIsTelegramConnecting(false);

          telegramAbortControllerRef.current = null;
        },

        onTimeout: () => {
          if (controller.signal.aborted) return;

          setIsTelegramConnecting(false);

          setSubmitError("Telegram connection timed out. Please try again.");

          telegramAbortControllerRef.current = null;
        },
      });
    } catch (error) {
      // Expected when component unmounts or connection is cancelled
      if (
        controller.signal.aborted ||
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error("Telegram connection failed:", error);

      setIsTelegramConnecting(false);

      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to connect Telegram.",
      );

      telegramAbortControllerRef.current = null;
    }
  };
  return (
    <div className="digest-setup-form">
      {/* Heading */}
      <h1 className="form-heading">
        Hi, {userName} — let's set up your digest
      </h1>

      <p className="form-subheading">
        Configure your daily briefings. We'll deliver a curated selection of
        stories directly to your preferred channel.
      </p>

      {/* Form */}
      <form className="form-card" onSubmit={handleSubmit}>
        {/* Categories */}
        <div className="form-section">
          <label className="form-label">Categories</label>

          <div className="pill-group">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  className={`pill ${isSelected ? "pill--active" : ""}`}
                  onClick={() => toggleCategory(category)}
                  aria-pressed={isSelected}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {errors.categories && (
            <p className="form-error">{errors.categories}</p>
          )}
        </div>

        {/* Language & Delivery Time */}
        <div className="form-row">
          {/* Language */}
          <div className="form-section form-section--half">
            <label className="form-label">Language</label>

            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${
                  selectedLanguage === "English" ? "toggle-btn--active" : ""
                }`}
                onClick={() => handleLanguageChange("English")}
              >
                English
              </button>

              <button
                type="button"
                className={`toggle-btn ${
                  selectedLanguage === "Hindi" ? "toggle-btn--active" : ""
                }`}
                onClick={() => handleLanguageChange("Hindi")}
              >
                हिंदी
              </button>
            </div>

            {errors.language && <p className="form-error">{errors.language}</p>}
          </div>

          {/* Delivery Time */}
          <div className="form-section form-section--half">
            <label htmlFor="delivery-time" className="form-label">
              Delivery Time
            </label>

            <div
              className={`delivery-time-wrapper ${
                errors.deliveryTime ? "dropdown--error" : ""
              }`}
            >
              {/* Preset / Custom selector */}
              <div className="dropdown">
                <select
                  id="delivery-time"
                  value={isCustomTime ? "CUSTOM" : deliveryTime}
                  onChange={handleTimeChange}
                  className="time-select"
                >
                  <option value="" disabled>
                    Select delivery time
                  </option>

                  {DELIVERY_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}

                  <option value="CUSTOM">Custom time</option>
                </select>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="dropdown-icon"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Custom time picker */}
              {isCustomTime && (
                <input
                  type="time"
                  className="custom-time-input"
                  value={getCustomTimeValue()}
                  onChange={handleCustomTimeChange}
                  aria-label="Custom delivery time"
                />
              )}
            </div>

            {errors.deliveryTime && (
              <p className="form-error">{errors.deliveryTime}</p>
            )}
          </div>
        </div>

        {/* WhatsApp Number */}
        <div className="form-section">
          <label htmlFor="whatsapp-number" className="form-label">
            WhatsApp Number
          </label>

          <div
            className={`phone-input ${
              errors.phoneNumber ? "phone-input--error" : ""
            }`}
          >
            <span className="phone-prefix">+91</span>

            <input
              id="whatsapp-number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit number"
              maxLength={10}
              className="phone-field"
            />
          </div>

          {errors.phoneNumber && (
            <p className="form-error">{errors.phoneNumber}</p>
          )}

          <p className="phone-hint">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#bbb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />

              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            We never share your number.
          </p>
        </div>

        {/* Server Error */}
        {submitError && <div className="form-submit-error">{submitError}</div>}

        {/* Telegram */}
        <div className="form-section telegram-section">
          <label className="form-label">Telegram</label>

          <div className="telegram-connect-card">
            <div className="telegram-info">
              <div className="telegram-icon">✈</div>

              <div>
                <h3>Get your digest on Telegram</h3>

                <p>
                  Connect your Telegram account to receive your daily NewsMint
                  digest.
                </p>
              </div>
            </div>

            {telegram?.connected ? (
              <div className="telegram-connected">
                <span className="telegram-status-dot" />

                <span>Telegram Connected</span>

                <button
                  type="button"
                  className="telegram-change-btn"
                  onClick={() =>
                    onTelegramConnect?.({
                      chatId: null,
                      connected: false,
                    })
                  }
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="telegram-connect-btn"
                onClick={handleTelegramConnect}
                disabled={isTelegramConnecting}
                aria-busy={isTelegramConnecting}
              >
                {isTelegramConnecting ? (
                  <>
                    <SpinLoader />
                    <span>Waiting for Telegram...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Telegram</span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Success */}
        {submitSuccess && (
          <div className="form-submit-success">
            Preferences saved successfully!
          </div>
        )}

        {/* Save */}
        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <SpinLoader />
                Saving...
              </>
            ) : (
              <>
                Save preferences
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DigestSetupForm;
