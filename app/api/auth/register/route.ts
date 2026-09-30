import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  validateRequiredLegalAcceptance,
  recordRequiredLegalAcceptance,
} from "@/lib/legal/legalAcceptanceService";
import { createEmailVerificationToken } from "@/lib/auth/emailVerificationService";
import { sendTransactionalEmail } from "@/lib/email/emailService";
import { verificationEmailTemplate } from "@/lib/email/emailTemplates";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getAuditRequestContext } from "@/lib/audit/auditRequestContext";

export async function POST(request: Request) {
  try {
    const auditContext =
      getAuditRequestContext(request);

    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    const termsAccepted =
      body?.termsAccepted === true;

    const privacyAccepted =
      body?.privacyAccepted === true;

    const acceptableUseAccepted =
      body?.acceptableUseAccepted === true;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Name, email, and password are required.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const legalError =
      validateRequiredLegalAcceptance({
        termsAccepted,
        privacyAccepted,
        acceptableUseAccepted,
      });

    if (legalError) {
      return NextResponse.json(
        { error: legalError },
        { status: 400 },
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          emailVerifiedAt: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash =
      await hashPassword(password);

    const user =
      await prisma.$transaction(async (tx) => {
        const createdUser =
          await tx.user.create({
            data: {
              name,
              email,
              passwordHash,
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });

        await recordRequiredLegalAcceptance(
          tx,
          createdUser.id,
          {
            termsAccepted,
            privacyAccepted,
            acceptableUseAccepted,
          },
          {
            ipAddress:
              auditContext.ipAddress ?? undefined,
            userAgent:
              auditContext.userAgent ?? undefined,
          },
        );

        return createdUser;
      });

    await recordAuditEvent({
      actorId: user.id,

      action: AUDIT_ACTIONS.USER_REGISTERED,

      category: "USER",
      severity: "INFO",
      outcome: "SUCCESS",

      entityType: "User",
      entityId: user.id,

      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      requestId: auditContext.requestId,
      correlationId: auditContext.correlationId,

      metadata: {
        method: "password_registration",
        legalAcceptanceRecorded: true,
      },
    });

    const verificationToken =
      await createEmailVerificationToken(user.id);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "https://smatpic.com";

    const verificationUrl =
      `${appUrl}/verify-email?token=${encodeURIComponent(
        verificationToken,
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

    return NextResponse.json(
      {
        message:
          "Account created. Please check your email to verify your account.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to create account.",
      },
      { status: 500 },
    );
  }
}