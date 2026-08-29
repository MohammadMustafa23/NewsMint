import React, { lazy, Suspense } from "react";
import "./App.css";

import ProtectedRoute from "./security/ProtectedRoute";

import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

// =========================================================
// LAZY LOADED PAGES
// =========================================================

const LandingPage = lazy(() => import("./Components/Pages/LandingPage"));

const AuthPages = lazy(() => import("./Components/Pages/AuthPages"));

const Preference = lazy(() => import("./Components/Pages/Preference"));

const DashBoard = lazy(() => import("./Components/Pages/Dashboard"));

// =========================================================
// LAZY LOADED DASHBOARD PAGES
// =========================================================

const HomeDash = lazy(() => import("./Components/Dashboard/HomePage/HomeDash"));

const HomeSource = lazy(
  () => import("./Components/Dashboard/Source/HomeSource"),
);

const HomeTopNews = lazy(
  () => import("./Components/Dashboard/TopNews/HomeTopNews"),
);

// =========================================================
// LAZY LOADED LEGAL PAGES
// =========================================================

const PrivacyPolicy = lazy(
  () => import("./Components/HeroCTAPAGE/Footer/PrivacyPolicy"),
);

const TermsOfService = lazy(
  () => import("./Components/HeroCTAPAGE/Footer/TermsOfService"),
);

// =========================================================
// LAZY LOADED NOT FOUND
// =========================================================

const NotFound = lazy(() => import("./common/NotFound"));

// =========================================================
// PAGE LOADER
// =========================================================

const PageLoader = () => {
  return (
    <div className="app-page-loader">
      <div className="app-page-loader__spinner" />
      <p>Loading...</p>
    </div>
  );
};

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        duration={3500}
        closeButton
        expand={false}
        toastOptions={{
          classNames: {
            toast: "news-toast",
            title: "news-toast__title",
            description: "news-toast__description",

            success: "news-toast--success",
            error: "news-toast--error",
            warning: "news-toast--warning",
            info: "news-toast--info",
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* =================================================
              PUBLIC
          ================================================= */}

          <Route path="/" element={<LandingPage />} />

          <Route path="/authentication-page" element={<AuthPages />} />

          {/* =================================================
              USER SETUP
          ================================================= */}

          <Route
            path="/preference"
            element={
              <ProtectedRoute requireNoPreferences>
                <Preference />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/home-page"
            element={
              <ProtectedRoute requirePreferences>
                <DashBoard />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomeDash />} />

            <Route path="source" element={<HomeSource />} />

            <Route path="top-news" element={<HomeTopNews />} />
          </Route>

          {/* =================================================
              LEGAL
          ================================================= */}

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* =================================================
              NOT FOUND
          ================================================= */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
