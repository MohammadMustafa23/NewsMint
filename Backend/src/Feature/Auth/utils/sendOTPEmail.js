import transporter from "../../../config/mail.js";
import { EMAIL_USER } from "../../../config/env.js";

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"NewsMint" <${EMAIL_USER}>`,
      to: email,
      subject: "Your NewsMint Verification Code",

      text: `Welcome to NewsMint!

Your verification code is: ${otp}

This code will expire in 5 minutes.

If you did not request this code, you can safely ignore this email.

— NewsMint Team`,

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>NewsMint Verification</title>
          </head>

          <body
            style="
              margin:0;
              padding:0;
              background-color:#f8f6fc;
              font-family:Arial,Helvetica,sans-serif;
              color:#18213a;
            "
          >

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="background-color:#f8f6fc;padding:40px 16px;"
            >
              <tr>
                <td align="center">

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                      max-width:520px;
                      background:#ffffff;
                      border:1px solid #e0dced;
                      border-radius:10px;
                      overflow:hidden;
                    "
                  >

                    <!-- Header -->

                    <tr>
                      <td
                        style="
                          padding:28px 30px 20px;
                          text-align:center;
                          border-bottom:1px solid #eeeaf4;
                        "
                      >

                        <div
                          style="
                            font-family:Georgia,'Times New Roman',serif;
                            font-size:30px;
                            font-weight:700;
                            color:#eda83b;
                            line-height:1.2;
                          "
                        >
                          NewsMint
                        </div>

                      </td>
                    </tr>


                    <!-- Main Content -->

                    <tr>
                      <td
                        style="
                          padding:34px 30px;
                          text-align:center;
                        "
                      >

                        <h1
                          style="
                            margin:0 0 10px;
                            font-family:Georgia,'Times New Roman',serif;
                            font-size:26px;
                            line-height:1.3;
                            color:#18213a;
                          "
                        >
                          Verify Your Email
                        </h1>

                        <p
                          style="
                            margin:0 auto 24px;
                            max-width:390px;
                            font-size:14px;
                            line-height:1.6;
                            color:#5b5b6b;
                          "
                        >
                          Use the verification code below to complete your
                          NewsMint account setup.
                        </p>


                        <!-- OTP -->

                        <div
                          style="
                            display:inline-block;
                            margin:4px 0 22px;
                            padding:16px 24px;
                            background:#faf8f2;
                            border:1px solid #eadfc9;
                            border-radius:8px;
                          "
                        >
                          <div
                            style="
                              font-size:34px;
                              font-weight:700;
                              letter-spacing:8px;
                              color:#946000;
                              line-height:1.2;
                            "
                          >
                            ${otp}
                          </div>
                        </div>


                        <!-- Expiry -->

                        <p
                          style="
                            margin:0 0 18px;
                            font-size:13px;
                            line-height:1.6;
                            color:#5b5b6b;
                          "
                        >
                          This code will expire in
                          <strong style="color:#18213a;">
                            5 minutes
                          </strong>.
                        </p>


                        <!-- Security Notice -->

                        <div
                          style="
                            margin:0 auto;
                            max-width:400px;
                            padding:12px 14px;
                            background:#faf8f2;
                            border-radius:6px;
                            text-align:left;
                          "
                        >

                          <p
                            style="
                              margin:0;
                              font-size:12px;
                              line-height:1.6;
                              color:#73798a;
                            "
                          >
                            For your security, never share this verification
                            code with anyone. NewsMint will never ask you for
                            your OTP.
                          </p>

                        </div>


                        <p
                          style="
                            margin:22px 0 0;
                            font-size:12px;
                            line-height:1.6;
                            color:#85859b;
                          "
                        >
                          Didn't request this code? You can safely ignore
                          this email.
                        </p>

                      </td>
                    </tr>


                    <!-- Footer -->

                    <tr>
                      <td
                        style="
                          padding:18px 25px;
                          background:#faf8fc;
                          border-top:1px solid #eeeaf4;
                          text-align:center;
                        "
                      >

                        <p
                          style="
                            margin:0;
                            font-size:11px;
                            line-height:1.5;
                            color:#85859b;
                          "
                        >
                          © 2026 NewsMint. A Free Personal Project.
                        </p>

                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

          </body>
        </html>
      `,
    });

    console.log(`OTP email sent to ${email}`);
  } catch (err) {
    console.error("Send OTP Email Error:", err);
    throw err;
  }
};

export default sendOTPEmail;
