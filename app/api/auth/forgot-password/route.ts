import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { createPasswordResetToken } from "@/lib/auth/passwordResetService";
import { sendTransactionalEmail } from "@/lib/email/emailService";
import { passwordResetEmailTemplate } from "@/lib/email/emailTemplates";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getAuditRequestContext } from "@/lib/audit/auditRequestContext";


export async function POST(request: Request) {
  try {

	const auditContext =
  getAuditRequestContext(request);

    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Email address is required.",
        },
        { status: 400 },
      );
    }

    const user =
      await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

    /*
     * Always return the same response whether
     * the account exists or not.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email address, password reset instructions have been sent.",
      });
    }

    const rawToken =
      await createPasswordResetToken(user.id);

	  await recordAuditEvent({
  actorId: user.id,

  action:
    AUDIT_ACTIONS.SECURITY_PASSWORD_RESET_REQUESTED,

  category: "SECURITY",
  severity: "INFO",
  outcome: "SUCCESS",

  entityType: "User",
  entityId: user.id,

  ipAddress: auditContext.ipAddress,
  userAgent: auditContext.userAgent,
  requestId: auditContext.requestId,
  correlationId: auditContext.correlationId,

  metadata: {
    method: "password_reset_request",
  },
});

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL;

    if (!appUrl) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL or APP_URL is not configured.",
      );
    }

    const resetUrl =
      `${appUrl}/reset-password?token=${encodeURIComponent(
        rawToken,
      )}`;

    const emailContent =
      passwordResetEmailTemplate({
        name: user.name || "there",
        resetUrl,
      });

    await sendTransactionalEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email address, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to process your request. Please try again.",
      },
      { status: 500 },
    );
  }
}