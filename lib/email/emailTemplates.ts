const APP_NAME = "SmatPic";

export function verificationEmailTemplate(input: {
  name: string;
  verificationUrl: string;
}) {
  return {
    subject: "Verify your SmatPic email address",

    text: `Hi ${input.name},

Welcome to ${APP_NAME}.

Please verify your email address by opening the link below:

${input.verificationUrl}

This verification link will expire after 24 hours.

If you did not create a SmatPic account, you can safely ignore this email.

Regards,
${APP_NAME}`,
    
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Verify your SmatPic email address</h2>

        <p>Hi ${escapeHtml(input.name)},</p>

        <p>
          Welcome to <strong>${APP_NAME}</strong>.
        </p>

        <p>
          Please verify your email address to activate your account.
        </p>

        <p>
          <a
            href="${escapeHtml(input.verificationUrl)}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#111;
              color:#fff;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Verify my email
          </a>
        </p>

        <p>
          This verification link will expire after 24 hours.
        </p>

        <p>
          If you did not create a SmatPic account, you can safely ignore this email.
        </p>

        <p>
          Regards,<br />
          ${APP_NAME}
        </p>
      </div>
    `,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}