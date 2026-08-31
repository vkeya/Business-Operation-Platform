import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

const CURRENT_BUSINESS_COOKIE =
  "teketeke_current_business";

export async function POST(
  request: Request,
) {
  try {
    const session =
      await getServerSession(authOptions);

    const userId =
      typeof session?.user?.id === "string"
        ? session.user.id
        : null;

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Authentication is required.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const businessId =
      body?.businessId;

    if (
      typeof businessId !== "string" ||
      !businessId
    ) {
      return NextResponse.json(
        {
          error:
            "Business ID is required.",
        },
        { status: 400 },
      );
    }

    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          userId,
          businessId,
          isActive: true,
          business: {
            status: "ACTIVE",
          },
        },
        select: {
          businessId: true,
        },
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this business.",
        },
        { status: 403 },
      );
    }

    const cookieStore =
      await cookies();

    cookieStore.set(
      CURRENT_BUSINESS_COOKIE,
      membership.businessId,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        path: "/",
      },
    );

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to switch business.",
      },
      { status: 500 },
    );
  }
}