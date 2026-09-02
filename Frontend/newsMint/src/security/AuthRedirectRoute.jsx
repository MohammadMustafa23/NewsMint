import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/auth.service.js";
import SpinLoader from "../common/SpinLoader";

const AuthRedirectRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();

        if (response?.success) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <SpinLoader />;
  }

  // Already logged in
  if (isAuthenticated) {
    return <Navigate to="/home-page" replace />;
  }

  // Not logged in → show Login/Auth page
  return children;
};

export default AuthRedirectRoute;
