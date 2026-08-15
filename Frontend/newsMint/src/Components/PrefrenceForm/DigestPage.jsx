import React, { useState } from "react";
import { toast } from "sonner";

import DigestSetupForm from "./DigestSetupForm";
import LivePreview from "./LivePreview";

import { savePreferences } from "../../services/prefrence.service";
import SpinLoader from "../../common/SpinLoader";

import "./style/DigestPage.css";
import { useNavigate } from "react-router-dom";

const DigestPage = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    categories: ["Tech", "Markets"],
    language: "English",
    deliveryTime: "07:30 AM (IST)",
    phoneNumber: "9876543210",
  });

  const [isSaving, setIsSaving] = useState(false);

  /*
   * -----------------------------------------
   * Save Preferences
   * -----------------------------------------
   */

  const handleSave = async (formData) => {
    try {
      const response = await savePreferences(formData);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to save preferences.");
      }

      toast.success(response.message || "Preferences saved successfully!");

      console.log("Current Path:", window.location.pathname);

      navigate("/home-page", {
        replace: true,
      });

      console.log("After Navigate:", window.location.pathname);

      return response;
    } catch (error) {
      console.error("Save Preferences Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving preferences.",
      );

      throw error;
    }
  };
  /*
   * -----------------------------------------
   * Categories
   * -----------------------------------------
   */

  const handleCategoryToggle = (categories) => {
    setPreferences((prev) => ({
      ...prev,
      categories,
    }));
  };

  /*
   * -----------------------------------------
   * Language
   * -----------------------------------------
   */

  const handleLanguageChange = (language) => {
    setPreferences((prev) => ({
      ...prev,
      language,
    }));
  };

  /*
   * -----------------------------------------
   * Delivery Time
   * -----------------------------------------
   */

  const handleTimeChange = (deliveryTime) => {
    setPreferences((prev) => ({
      ...prev,
      deliveryTime,
    }));
  };

  /*
   * -----------------------------------------
   * WhatsApp Number
   * -----------------------------------------
   */

  const handlePhoneChange = (phoneNumber) => {
    setPreferences((prev) => ({
      ...prev,
      phoneNumber,
    }));
  };

  return (
    <div className="digest-page">
      <div className="digest-page__grid">
        {/* Preference Form */}
        <DigestSetupForm
          userName="Jayesh"
          phoneNumber={preferences.phoneNumber}
          selectedCategories={preferences.categories}
          selectedLanguage={preferences.language}
          deliveryTime={preferences.deliveryTime}
          onSave={handleSave}
          onCategoryToggle={handleCategoryToggle}
          onLanguageChange={handleLanguageChange}
          onTimeChange={handleTimeChange}
          onPhoneChange={handlePhoneChange}
        />

        {/* Live Preview */}
        <LivePreview
          userName="Jayesh"
          categories={preferences.categories}
          language={preferences.language}
          phoneNumber={preferences.phoneNumber}
          timestamp={preferences.deliveryTime}
        />
      </div>
    </div>
  );
};

export default DigestPage;
