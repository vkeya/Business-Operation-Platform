import { NextResponse } from "next/server";
import crypto from "crypto";

import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getAuditRequestContext } from "@/lib/audit/auditRequestContext";
import { prisma } from "@/lib/database/prisma";
import { hashPassword } from "@/lib/auth/password";

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const auditContext =
      getAuditRequestContext(request);

    const body = await request.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!token || !password) {
      return NextResponse.json(
        {
          error:
            "Reset token and new password are required.",
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

    const tokenHash = hashToken(token);

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid.",
        },
        { status: 400 },
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          error:
            "This password reset link has already been used.",
        },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          error:
            "This password reset link has expired.",
        },
        { status: 400 },
      );
    }

    const passwordHash =
      await hashPassword(password);

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
          passwordChangedAt: now,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: now,
        },
      }),

      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: {
            not: resetToken.id,
          },
        },
        data: {
          usedAt: now,
        },
      }),
    ]);

    await recordAuditEvent({
      actorId: resetToken.userId,

      action:
        AUDIT_ACTIONS.SECURITY_PASSWORD_RESET_COMPLETED,

      category: "SECURITY",
      severity: "WARNING",
      outcome: "SUCCESS",

      entityType: "User",
      entityId: resetToken.userId,

      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      requestId: auditContext.requestId,
      correlationId: auditContext.correlationId,

      metadata: {
        method: "password_reset_token",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to reset your password. Please try again.",
      },
      { status: 500 },
    );
  }
}