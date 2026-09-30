
import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/database/prisma";
import { sendTransactionalEmail } from "@/lib/email/emailService";
import { verificationEmailTemplate } from "@/lib/email/emailTemplates";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";

const TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    /*
     * Always return the same response for unknown emails.
     * This prevents account enumeration.
     */
    const genericResponse = NextResponse.json({
      success: true,
      message:
        "If an account exists and requires verification, a verification email has been sent.",
    });

    if (!email) {
      return genericResponse;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || user.emailVerifiedAt) {
      return genericResponse;
    }

    /*
     * Invalidate existing unused verification tokens.
     */
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const rawToken =
      crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "https://smatpic.com";

    const verificationUrl =
      `${appUrl}/verify-email?token=${encodeURIComponent(
        rawToken,
      )}`;

    const verificationEmail =
      verificationEmailTemplate({
        name: user.name,
        verificationUrl,
      });

    await sendTransactionalEmail({
      to: user.email,
      subject: verificationEmail.subject,
      html: verificationEmail.html,
      text: verificationEmail.text,
    });

    await recordAuditEvent({
      actorId: user.id,

      action:
        AUDIT_ACTIONS.AUTH_EMAIL_VERIFICATION_RESENT,

      category: "SECURITY",
      severity: "INFO",
      outcome: "SUCCESS",

      entityType: "User",
      entityId: user.id,

      ipAddress:
        request.headers
          .get("x-forwarded-for")
          ?.split(",")[0]
          ?.trim() ||
        request.headers.get("x-real-ip"),

      userAgent:
        request.headers.get("user-agent"),

      metadata: {
        method: "email_verification_resend",
      },
    });

    return genericResponse;
  } catch (error) {
    console.error(
      "Resend verification error:",
      error,
    );

    /*
     * Do not expose provider/database details.
     */
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists and requires verification, a verification email has been sent.",
      },
    );
  }
}
