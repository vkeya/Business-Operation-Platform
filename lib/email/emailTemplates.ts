

const APP_NAME = "SmatPic";
const APP_TAGLINE = "Business Operations Platform";

export function verificationEmailTemplate(input: {
  name: string;
  verificationUrl: string;
}) {
  const safeName = escapeHtml(input.name);
  const safeVerificationUrl = escapeHtml(
    input.verificationUrl,
  );

  return {
    subject: "Verify your SmatPic account",

    text: `Hi ${input.name},

Welcome to ${APP_NAME} — ${APP_TAGLINE}.

Your account has been created successfully.

Please verify your email address to secure your account and activate access to your SmatPic workspace.

Verify your email:
${input.verificationUrl}

This verification link expires in 24 hours.

If you did not create a SmatPic account, you can safely ignore this email.

Regards,
The ${APP_NAME} Team

${APP_NAME}
${APP_TAGLINE}`,

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Verify your SmatPic account</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f7fa;
    font-family:Arial, Helvetica, sans-serif;
    color:#0f172a;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f4f7fa; padding:40px 16px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(15,23,42,0.08);
          "
        >

          <!-- Header -->
          <tr>
            <td
              style="
                background:#020617;
                padding:28px 32px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    style="
                      font-size:22px;
                      font-weight:700;
                      color:#ffffff;
                    "
                  >
                    <span
                      style="
                        display:inline-block;
                        width:34px;
                        height:34px;
                        line-height:34px;
                        text-align:center;
                        border-radius:10px;
                        background:#06b6d4;
                        color:#020617;
                        font-size:18px;
                        font-weight:800;
                        margin-right:10px;
                        vertical-align:middle;
                      "
                    >
                      S
                    </span>

                    ${APP_NAME}
                  </td>

                </tr>

                <tr>
                  <td
                    style="
                      padding-top:7px;
                      padding-left:45px;
                      color:#94a3b8;
                      font-size:12px;
                    "
                  >
                    ${APP_TAGLINE}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent -->
          <tr>
            <td
              style="
                height:4px;
                background:#06b6d4;
                font-size:0;
                line-height:0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td
              style="
                padding:42px 40px 36px;
              "
            >

              <p
                style="
                  margin:0 0 10px;
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  letter-spacing:0.08em;
                  text-transform:uppercase;
                "
              >
                Welcome to SmatPic
              </p>

              <h1
                style="
                  margin:0;
                  color:#0f172a;
                  font-size:30px;
                  line-height:1.25;
                  font-weight:700;
                "
              >
                Verify your email address
              </h1>

              <p
                style="
                  margin:22px 0 0;
                  font-size:16px;
                  line-height:1.7;
                  color:#475569;
                "
              >
                Hi ${safeName},
              </p>

              <p
                style="
                  margin:12px 0 0;
                  font-size:16px;
                  line-height:1.7;
                  color:#475569;
                "
              >
                Your SmatPic account has been created successfully.
                Please verify your email address to secure your account
                and activate access to your business workspace.
              </p>

              <!-- CTA -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin:30px 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      border-radius:10px;
                      background:#020617;
                    "
                  >
                    <a
                      href="${safeVerificationUrl}"
                      style="
                        display:inline-block;
                        padding:15px 26px;
                        border-radius:10px;
                        background:#020617;
                        color:#ffffff;
                        font-size:15px;
                        font-weight:700;
                        text-decoration:none;
                      "
                    >
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security information -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top:10px;
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:12px;
                "
              >
                <tr>
                  <td
                    style="
                      padding:18px 20px;
                    "
                  >
                    <p
                      style="
                        margin:0;
                        color:#334155;
                        font-size:13px;
                        font-weight:700;
                      "
                    >
                      Security information
                    </p>

                    <p
                      style="
                        margin:7px 0 0;
                        color:#64748b;
                        font-size:13px;
                        line-height:1.6;
                      "
                    >
                      This verification link expires after
                      <strong>24 hours</strong>.
                      For your security, do not share this link with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:28px 0 0;
                  color:#64748b;
                  font-size:13px;
                  line-height:1.7;
                "
              >
                If you did not create a SmatPic account,
                you can safely ignore this email.
              </p>

              <p
                style="
                  margin:28px 0 0;
                  color:#475569;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                Regards,<br />
                <strong>The ${APP_NAME} Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding:24px 32px;
                background:#f8fafc;
                border-top:1px solid #e2e8f0;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  color:#0f172a;
                  font-size:14px;
                  font-weight:700;
                "
              >
                ${APP_NAME}
              </p>

              <p
                style="
                  margin:5px 0 0;
                  color:#64748b;
                  font-size:12px;
                "
              >
                ${APP_TAGLINE}
              </p>

              <p
                style="
                  margin:12px 0 0;
                  color:#94a3b8;
                  font-size:11px;
                  line-height:1.5;
                "
              >
                Secure. Connected. Simple.
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