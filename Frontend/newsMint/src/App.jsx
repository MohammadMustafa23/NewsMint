import "./App.css";

import LandingPage from "./Components/Pages/LandingPage";
import AuthPages from "./Components/Pages/AuthPages";
import Preference from "./Components/Pages/Preference";
import DashBoard from "./Components/Pages/Dashboard";
import ProtectedRoute from "./security/ProtectedRoute";

import HomeDash from "./Components/Dashboard/HomePage/HomeDash";
import HomeSource from "./Components/Dashboard/Source/HomeSource";
import HomeTopNews from "./Components/Dashboard/TopNews/HomeTopNews";


import PrivacyPolicy from "./Components/HeroCTAPAGE/Footer/PrivacyPolicy";
import TermsOfService from "./Components/HeroCTAPAGE/Footer/TermsOfService";

import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

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

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/authentication-page" element={<AuthPages />} />

        {/* User Setup */}
        <Route
          path="/preference"
          element={
            <ProtectedRoute requireNoPreferences>
              <Preference />
            </ProtectedRoute>
          }
        />

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

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </>
  );
}

export default App;
