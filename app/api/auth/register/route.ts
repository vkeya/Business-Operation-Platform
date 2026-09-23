import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  validateRequiredLegalAcceptance,
  recordRequiredLegalAcceptance,
} from "@/lib/legal/legalAcceptanceService";

export async function POST(request: Request) {
  try {
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
        select: { id: true },
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

    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const realIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const userAgent =
      request.headers.get("user-agent") ||
      undefined;

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
            ipAddress: realIp,
            userAgent,
          },
        );

        return createdUser;
      });

    return NextResponse.json(
      { user },
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