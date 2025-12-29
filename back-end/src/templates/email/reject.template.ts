export const getRejectApplicationEmailTemplate = (
  name: string,
  reason: string,
  supportEmail?: string,
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Rejected</title>
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
            color: #c0392b;
        }
        .reason-box {
            background-color: #f8d7da;
            border-left: 4px solid #c0392b;
            padding: 12px;
            margin: 16px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <h1 class="header">Hello ${name},</h1>

    <p>Thank you for submitting your application.</p>

    <p>After careful review, we regret to inform you that your application has been <strong>rejected</strong>.</p>

    <p><strong>Reason for rejection:</strong></p>
    <div class="reason-box">
        ${reason}
    </div>

    <p>
        If you believe this decision was made in error or you would like to provide additional information,
        please feel free to contact our support team.
    </p>

    ${
      supportEmail
        ? `<p>📧 Support email: <a href="mailto:${supportEmail}">${supportEmail}</a></p>`
        : ""
    }

    <div class="footer">
        <p>Thank you for your interest in our platform.</p>
        <p>Best regards,<br/>The Support Team</p>
    </div>
</body>
</html>
`;
