import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/auth.service.js";
import { checkMyPreferences } from "../services/prefrence.service.js";
import SpinLoader from "../common/SpinLoader";

const ProtectedRoute = ({
  children,
  requirePreferences = false,
  requireNoPreferences = false,
}) => {
  console.log("🔥 ProtectedRoute RENDERED");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);

        console.log("🔥 checkAccess STARTED");

        const userResponse = await getCurrentUser();

        console.log("ProtectedRoute User:", userResponse);

        if (!userResponse?.success) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        const preferenceResponse = await checkMyPreferences();

        console.log("ProtectedRoute Preferences:", preferenceResponse);

        setHasPreferences(Boolean(preferenceResponse?.hasPreferences));
      } catch (error) {
        console.error("Protected Route Error:", error);

        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requirePreferences, requireNoPreferences]);

  // While checking authentication/preferences
  if (loading) {
    return <SpinLoader />;
  }

  // User is NOT logged in
  if (!isAuthenticated) {
    return <Navigate to="/authantication-page" replace />;
  }

  // Route requires preferences
  // Example: Dashboard
  if (requirePreferences && !hasPreferences) {
    return <Navigate to="/preference" replace />;
  }

  // Route should ONLY be available
  // before preferences are completed
  // Example: Preference page
  if (requireNoPreferences && hasPreferences) {
    return <Navigate to="/home-page" replace />;
  }

  return children;
};

export default ProtectedRoute;
