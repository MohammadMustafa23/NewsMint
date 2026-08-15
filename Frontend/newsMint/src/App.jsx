import "./App.css";
import LandingPage from "./Components/Pages/LandingPage";
import AuthPages from "./Components/Pages/AuthPages";

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/authantication-page" element={<AuthPages />} />
      </Routes>
    </>
  );
}

export default App;
