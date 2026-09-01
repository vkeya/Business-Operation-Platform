import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          business: {
            status: "ACTIVE",
          },
        },
        select: {
          businessId: true,
        },
      });

    return NextResponse.json({
      destination: membership
        ? "/dashboard"
        : "/setup",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to determine post-login destination.",
      },
      { status: 401 },
    );
  }
}