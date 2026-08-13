import React, { useState, useRef } from "react";
import "./style/VerifyEmail.css";

const VerifyEmail = ({ email = "user@example.com" }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      console.log("OTP submitted:", code);
    }
  };

  const handleResend = () => {
    console.log("Resend OTP");
  };

  return (
    <div className="verify-email">
      <div className="verify-email__container">
        {/* Brand */}
        <h1 className="verify-email__brand">NewsMint</h1>

        {/* Card */}
        <div className="verify-email__card">
          {/* Header */}
          <div className="verify-email__header">
            <h2 className="verify-email__title">
              Verify Your
              <br />
              Email
            </h2>
            <p className="verify-email__subtitle">
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="verify-email__email">{email}</p>
          </div>

          {/* OTP Form */}
          <form className="verify-email__form" onSubmit={handleSubmit}>
            <div className="verify-email__otp">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="verify-email__otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  required
                />
              ))}
            </div>

            <button type="submit" className="verify-email__btn">
              Verify
            </button>
          </form>

          {/* Footer */}
          <p className="verify-email__footer">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="verify-email__resend"
              onClick={handleResend}
            >
              Resend code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
