import { useSearchParams } from "react-router-dom";

import Login from "../AuthPage/Login";
import Register from "../AuthPage/Register";
import OTPVerification from "../AuthPage/OTPVerification";
import ForgotPassword from "../AuthPage/ForgotPassword";
import ResetPassword from "../AuthPage/ResetPassword";

const VALID_PAGES = [
  "login",
  "register",
  "verify-email",
  "forgot-password",
  "verify-forgot-password",
  "reset-password",
];

const AuthPages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  // Default page
  const page = VALID_PAGES.includes(mode) ? mode : "login";

  const setPage = (nextPage) => {
    if (!VALID_PAGES.includes(nextPage)) {
      setSearchParams({ mode: "login" });
      return;
    }

    setSearchParams({ mode: nextPage });
  };

  const setAuthEmail = (email) => {
    sessionStorage.setItem("authEmail", email);
  };

  const getAuthEmail = () => {
    return sessionStorage.getItem("authEmail");
  };

  const clearAuthSession = () => {
    sessionStorage.removeItem("authEmail");
    sessionStorage.removeItem("authFlow");
  };

  return (
    <>
      {page === "login" && <Login setPage={setPage} />}

      {page === "register" && (
        <Register setPage={setPage} setAuthEmail={setAuthEmail} />
      )}

      {page === "verify-email" && (
        <OTPVerification
          type="email"
          setPage={setPage}
          email={getAuthEmail()}
          clearAuthSession={clearAuthSession}
        />
      )}

      {page === "forgot-password" && (
        <ForgotPassword setPage={setPage} setAuthEmail={setAuthEmail} />
      )}

      {page === "reset-password" && (
        <ResetPassword
          setPage={setPage}
          email={getAuthEmail()}
          clearAuthSession={clearAuthSession}
        />
      )}

      {page === "verify-forgot-password" && (
        <OTPVerification
          type="forgot-password"
          setPage={setPage}
          email={getAuthEmail()}
        />
      )}
    </>
  );
};

export default AuthPages;
