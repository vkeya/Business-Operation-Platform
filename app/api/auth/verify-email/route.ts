
import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token);

    const verificationToken =
      await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              emailVerifiedAt: true,
            },
          },
        },
      });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification link." },
        { status: 400 },
      );
    }

    if (verificationToken.usedAt) {
      return NextResponse.json(
        {
          error:
            "This verification link has already been used.",
        },
        { status: 400 },
      );
    }

    if (verificationToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          error:
            "This verification link has expired.",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    if (!verificationToken.user.emailVerifiedAt) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: verificationToken.user.id,
          },
          data: {
            emailVerifiedAt: now,
          },
        }),

        prisma.emailVerificationToken.update({
          where: {
            id: verificationToken.id,
          },
          data: {
            usedAt: now,
          },
        }),
      ]);
    } else {
      await prisma.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: now,
        },
      });
    }

    await recordAuditEvent({
      actorId: verificationToken.user.id,

      action:
        AUDIT_ACTIONS.SECURITY_EMAIL_VERIFIED,

      category: "SECURITY",
      severity: "INFO",
      outcome: "SUCCESS",

      entityType: "User",
      entityId: verificationToken.user.id,

      ipAddress:
        request.headers
          .get("x-forwarded-for")
          ?.split(",")[0]
          ?.trim() ||
        request.headers.get("x-real-ip"),

      userAgent:
        request.headers.get("user-agent"),

      metadata: {
        method: "email_verification_token",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Email address verified successfully.",
    });
  } catch (error) {
    console.error(
      "Email verification error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify email address.",
      },
      { status: 500 },
    );
  }
}
