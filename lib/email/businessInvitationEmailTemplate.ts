
const APP_NAME = "SmatPic";
const APP_TAGLINE = "Business Operations Platform";

interface BusinessInvitationEmailInput {
  inviteeName?: string;
  businessName: string;
  inviterName?: string;
  roleName: string;
  invitationUrl: string;
  expiresAt: Date;
}

function formatDisplayName(name?: string): string {
  return (name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}


export function businessInvitationEmailTemplate(
  input: BusinessInvitationEmailInput,
) {
  const inviteeName =
    input.inviteeName?.trim() || "there";

  const inviterName =
  formatDisplayName(input.inviterName) || "A SmatPic team member";

  const expiryDate =
    input.expiresAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const safeInviteeName = escapeHtml(inviteeName);
  const safeInviterName = escapeHtml(inviterName);
  const safeBusinessName = escapeHtml(input.businessName);
  const safeRoleName = escapeHtml(input.roleName);
  const safeInvitationUrl = escapeHtml(input.invitationUrl);

  return {
    subject: `You're invited to join ${input.businessName} on SmatPic`,

    text: `Hello ${inviteeName},

${inviterName} has invited you to join ${input.businessName} on ${APP_NAME}, the ${APP_TAGLINE}.

Your assigned role is: ${input.roleName}

Accept your invitation using this secure link:
${input.invitationUrl}

This invitation expires on ${expiryDate}. You must accept it using the email address to which this invitation was sent.

If you were not expecting this invitation, you can ignore this email.

Regards,
The ${APP_NAME} Team
${APP_TAGLINE}`,

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your SmatPic business invitation</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f7fa;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#020617;padding:26px 32px;">
              <div style="font-size:24px;font-weight:700;color:#ffffff;">SmatPic</div>
              <div style="margin-top:6px;font-size:12px;color:#94a3b8;">Business Operations Platform</div>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:#06b6d4;font-size:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0;color:#64748b;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Business invitation
              </p>
              <h1 style="margin:12px 0 0;font-size:28px;line-height:1.25;color:#0f172a;">
                You're invited to join ${safeBusinessName}
              </h1>
              <p style="margin:22px 0 0;font-size:15px;line-height:1.7;color:#475569;">
                Hello ${safeInviteeName},
              </p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">
                ${safeInviterName} has invited you to join
                <strong>${safeBusinessName}</strong> on SmatPic.
                Accept the invitation to access the business workspace.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:12px;color:#64748b;">Your assigned role</p>
                    <p style="margin:6px 0 0;font-size:16px;font-weight:700;color:#0f172a;">
                      ${safeRoleName}
                    </p>
                    <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Invitation expires</p>
                    <p style="margin:6px 0 0;font-size:14px;font-weight:600;color:#0f172a;">
                      ${expiryDate} (UTC date)
                    </p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                <tr>
                  <td style="background:#020617;border-radius:10px;">
                    <a href="${safeInvitationUrl}" style="display:inline-block;padding:15px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                You must accept this invitation using the email address to which it was sent.
                If you don't already have a SmatPic account, you can create one from the invitation page.
              </p>

              <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
                If the button doesn't work, copy this link into your browser:
              </p>
              <p style="margin:8px 0 0;word-break:break-all;font-size:12px;line-height:1.6;color:#475569;">
                ${safeInvitationUrl}
              </p>

              <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#475569;">
                Regards,<br /><strong>The SmatPic Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">SmatPic</p>
              <p style="margin:5px 0 0;font-size:12px;color:#64748b;">Business Operations Platform</p>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">
                This is an automated email. Please do not share your invitation link.
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
