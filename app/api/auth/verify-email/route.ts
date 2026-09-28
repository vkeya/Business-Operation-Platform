import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/database/prisma";

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
        { error: "This verification link has already been used." },
        { status: 400 },
      );
    }

    if (verificationToken.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This verification link has expired." },
        { status: 400 },
      );
    }

    if (!verificationToken.user.emailVerifiedAt) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: verificationToken.user.id,
          },
          data: {
            emailVerifiedAt: new Date(),
          },
        }),

        prisma.emailVerificationToken.update({
          where: {
            id: verificationToken.id,
          },
          data: {
            usedAt: new Date(),
          },
        }),
      ]);
    } else {
      await prisma.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      {
        error: "Unable to verify email address.",
      },
      { status: 500 },
    );
  }
}