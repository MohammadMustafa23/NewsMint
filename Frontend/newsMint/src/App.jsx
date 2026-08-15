import "./App.css";

import LandingPage from "./Components/Pages/LandingPage";
import AuthPages from "./Components/Pages/AuthPages";
import Prefrence from "./Components/Pages/Prefrence";
import DashBoard from "./Components/Pages/Dashboard";
import ProtectedRoute from "./security/ProtectedRoute";
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

        <Route path="/authantication-page" element={<AuthPages />} />

        {/* User Setup */}
        <Route
          path="/preference"
          element={
            <ProtectedRoute requireNoPreferences>
              <Prefrence />
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/home-page"
          element={
            <ProtectedRoute requirePreferences>
              <DashBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
