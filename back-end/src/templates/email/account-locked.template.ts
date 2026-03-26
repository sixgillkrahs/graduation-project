export const getAccountLockedEmailTemplate = (
  name: string,
  options: {
    lockType: "TEMPORARY" | "PERMANENT";
    reason?: string | null;
    lockedUntil?: string | null;
    appealUrl: string;
  },
) => {
  const lockDescription =
    options.lockType === "PERMANENT"
      ? "Your account has been locked permanently."
      : `Your account has been locked until ${options.lockedUntil || "the configured date"}.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
        <p style="margin: 0 0 12px;">Hello ${name || "Agent"},</p>
        <h2 style="margin: 0 0 16px; color: #b91c1c;">Your agent account has been locked</h2>
        <p style="margin: 0 0 12px; line-height: 1.6;">
          ${lockDescription}
        </p>
        ${
          options.reason
            ? `<p style="margin: 0 0 12px; line-height: 1.6;">
          <strong>Reason:</strong> ${options.reason}
        </p>`
            : ""
        }
        <p style="margin: 0 0 20px; line-height: 1.6;">
          If you believe this action should be reviewed, please send your explanation to the admin team using the button below.
        </p>
        <a
          href="${options.appealUrl}"
          style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600;"
        >
          Submit explanation request
        </a>
        <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
          This link helps the admin review your explanation and decide whether to unlock the account.
        </p>
      </div>
    </div>
  `;
};
