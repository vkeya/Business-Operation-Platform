import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/database/prisma";

const CURRENT_BUSINESS_COOKIE =
  "teketeke_current_business";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const businessId = body?.businessId;

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

    const business =
      await prisma.business.findFirst({
        where: {
          id: businessId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Business not found.",
        },
        { status: 404 },
      );
    }

    const cookieStore = await cookies();

    cookieStore.set(
      CURRENT_BUSINESS_COOKIE,
      business.id,
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