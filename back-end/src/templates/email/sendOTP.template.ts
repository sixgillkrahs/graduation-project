export const sendOTPEmailTemplate = (
  otp: string,
  expireMinutes: number = 5,
  supportEmail?: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      color: #2c3e50;
    }
    .otp-box {
      background-color: #f4f6f8;
      border-left: 4px solid #e74c3c;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 6px;
      border-radius: 6px;
    }
    .expire {
      font-size: 0.9em;
      color: #666;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #f39c12;
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <p>
    We received a request to reset your password.
    Please use the verification code below to continue:
  </p>

  <div class="otp-box">
    ${otp}
  </div>

  <p class="expire">
    ⏱ This code will expire in <strong>${expireMinutes} minutes</strong>.
  </p>

  <div class="warning">
    ⚠️ If you did not request this code, please ignore this email.
    Do not share this code with anyone.
  </div>

  ${supportEmail
    ? `<p>📧 Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>`
    : ""
  }

  <div class="footer">
    <p>Thank you for using our platform.</p>
    <p>Best regards,<br/>The Support Team</p>
  </div>
</body>
</html>
`;
