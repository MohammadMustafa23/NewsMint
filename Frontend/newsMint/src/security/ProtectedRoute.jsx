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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [user, setUser] = useState(null);

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

        // Save user
        setUser(userResponse.user);

        setIsAuthenticated(true);

        const preferenceResponse = await checkMyPreferences();

        console.log("ProtectedRoute Preferences:", preferenceResponse);

        setHasPreferences(Boolean(preferenceResponse?.hasPreferences));
      } catch (error) {
        console.error("Protected Route Error:", error);

        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requirePreferences, requireNoPreferences]);

  // Loading
  if (loading) {
    return <SpinLoader />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/authantication-page" replace />;
  }

  // Preferences required
  if (requirePreferences && !hasPreferences) {
    return <Navigate to="/preference" replace />;
  }

  // Preferences must NOT exist
  if (requireNoPreferences && hasPreferences) {
    return <Navigate to="/home-page" replace />;
  }

  // Pass user to child component
  return React.cloneElement(children, {
    user,
  });
};

export default ProtectedRoute;
