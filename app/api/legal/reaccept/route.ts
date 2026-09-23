import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { recordCurrentLegalReacceptance } from "@/lib/legal/legalReacceptanceService";

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? undefined;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const termsAccepted =
      body?.termsAccepted === true;

    const privacyAccepted =
      body?.privacyAccepted === true;

    const acceptableUseAccepted =
      body?.acceptableUseAccepted === true;

    const result =
      await recordCurrentLegalReacceptance(
        userId,
        {
          termsAccepted,
          privacyAccepted,
          acceptableUseAccepted,
        },
        {
          ipAddress: getRequestIp(request),
          userAgent:
            request.headers.get("user-agent") ??
            undefined,
        },
      );

    return NextResponse.json(
      {
        success: true,
        legal: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Legal reacceptance failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "We could not record your legal acceptance right now. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}