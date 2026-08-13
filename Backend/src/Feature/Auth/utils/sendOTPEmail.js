import transporter from "../../../config/mail.js";
import { EMAIL_USER } from "../../../config/env.js";

const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"UniFetch Media" <${EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px">
          <h2>Welcome to UniFetch Media</h2>

          <p>Your verification code is:</p>

          <h1 style="font-size:40px;letter-spacing:8px;color:#2563EB;">
            ${otp}
          </h1>

          <p>This code will expire in <strong>5 minutes</strong>.</p>

          <p>If you didn't request this account, you can safely ignore this email.</p>

          <br/>

          <p>— UniFetch Media Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default sendOTPEmail;