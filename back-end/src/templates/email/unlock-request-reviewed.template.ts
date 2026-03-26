export const getUnlockRequestReviewedEmailTemplate = (
  name: string,
  decision: "APPROVED" | "REJECTED",
) => {
  const isApproved = decision === "APPROVED";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
        <p style="margin: 0 0 12px;">Hello ${name || "Agent"},</p>
        <h2 style="margin: 0 0 16px; color: ${isApproved ? "#15803d" : "#b91c1c"};">
          ${
            isApproved
              ? "Your unlock request has been approved"
              : "Your unlock request has been rejected"
          }
        </h2>
        <p style="margin: 0 0 12px; line-height: 1.6;">
          ${
            isApproved
              ? "The admin team has approved your explanation and your agent account is now unlocked."
              : "The admin team has reviewed your explanation and decided to keep your agent account locked at this time."
          }
        </p>
        <p style="margin: 0; line-height: 1.6; color: #4b5563;">
          ${
            isApproved
              ? "You can sign in to continue using your account."
              : "If you need further support, please contact the admin team."
          }
        </p>
      </div>
    </div>
  `;
};
