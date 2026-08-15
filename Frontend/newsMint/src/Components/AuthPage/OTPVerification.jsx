import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import "./style/OTPVerification.css";
import SpinLoader from "../../common/SpinLoader";

import {
  verifyEmail,
  VerifyResetOTP,
  resendOTP,
} from "../../services/auth.service";

const OTPVerification = ({
  email,
  setPage,
  clearAuthSession,
  type = "email",
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);

  const isForgotPassword = type === "forgot-password";

  // --------------------------------
  // Configuration
  // --------------------------------

  const config = isForgotPassword
    ? {
        subtitle: "We've sent a 6-digit verification code to",
        verifyApi: VerifyResetOTP,
        resendApi: resendOTP,
        successMessage: "OTP verified successfully.",
      }
    : {
        subtitle: "We've sent a 6-digit verification code to",
        verifyApi: verifyEmail,
        resendApi: resendOTP,
        successMessage: "Email verified successfully.",
      };

  // --------------------------------
  // Check Email
  // --------------------------------

  useEffect(() => {
    if (!email) {
      setPage(isForgotPassword ? "forgot-password" : "register");
    }
  }, [email, setPage, isForgotPassword]);

  // --------------------------------
  // OTP Change
  // --------------------------------

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // --------------------------------
  // Keyboard Navigation
  // --------------------------------

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --------------------------------
  // Paste OTP
  // --------------------------------

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);

    inputRefs.current[focusIndex]?.focus();
  };

  // --------------------------------
  // Verify OTP
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || resendLoading) return;

    const code = otp.join("");

    // Validate OTP
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    // Validate email session
    if (!email) {
      toast.error("Email session expired.");
      return;
    }

    setLoading(true);

    try {
      const data = await config.verifyApi({
        email,
        otp: code,
      });

      console.log("OTP Verification Response:", data);

      // --------------------------------
      // API Failed
      // --------------------------------

      if (!data?.success) {
        toast.error(data?.message || "Invalid or expired OTP.");
        return;
      }

      // --------------------------------
      // Forgot Password
      // --------------------------------

      if (isForgotPassword) {
        /*
          Backend has already created the
          10-minute resetToken and stored it
          in an HttpOnly cookie.

          Frontend does NOT need to receive
          or store that token.
        */

        toast.success(data?.message || config.successMessage);

        setPage("reset-password");

        return;
      }

      // --------------------------------
      // Normal Email Verification
      // --------------------------------

      toast.success(data?.message || config.successMessage);

      // Clear temporary registration data
      clearAuthSession();

      // Give toast time to display
      setTimeout(() => {
        setPage("login");
      }, 500);
    } catch (error) {
      console.error("OTP Verification Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Resend OTP
  // --------------------------------

  const handleResend = async () => {
    if (loading || resendLoading) return;

    if (!email) {
      toast.error("Email session expired.");
      return;
    }

    setResendLoading(true);

    try {
      const data = await config.resendApi({
        email,
      });

      console.log("Resend OTP Response:", data);

      // --------------------------------
      // API Failed
      // --------------------------------

      if (!data?.success) {
        toast.error(data?.message || "Unable to resend OTP.");
        return;
      }

      // --------------------------------
      // Success
      // --------------------------------

      toast.success(data?.message || "A new OTP has been sent.");

      // Clear old OTP
      setOtp(["", "", "", "", "", ""]);

      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to resend OTP.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="otp-verification">
      <div className="otp-verification__container">
        {/* Brand */}
        <h1 className="otp-verification__brand">NewsMint</h1>

        {/* Card */}
        <div className="otp-verification__card">
          {/* Header */}
          <div className="otp-verification__header">
            <h2 className="otp-verification__title">
              {isForgotPassword ? (
                "Verify OTP"
              ) : (
                <>
                  Verify Your
                  <br />
                  Email
                </>
              )}
            </h2>

            <p className="otp-verification__subtitle">{config.subtitle}</p>

            <p className="otp-verification__email">{email}</p>
          </div>

          {/* OTP Form */}
          <form className="otp-verification__form" onSubmit={handleSubmit}>
            <div className="otp-verification__otp">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="otp-verification__input"
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || resendLoading}
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Verify */}
            <button
              type="submit"
              className="otp-verification__btn"
              disabled={loading || resendLoading}
            >
              {loading ? <SpinLoader size="small" /> : "Verify"}
            </button>
          </form>

          {/* Resend */}
          <p className="otp-verification__footer">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="otp-verification__resend"
              onClick={handleResend}
              disabled={loading || resendLoading}
            >
              {resendLoading ? <SpinLoader size="small" /> : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
