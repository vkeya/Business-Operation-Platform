
import { NextResponse } from "next/server";
import {
  getPaystackSecretKey,
} from "@/lib/subscription/providers/paystack/paystackConfiguration";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedToken =
    process.env.PAYSTACK_DIAGNOSTIC_TOKEN;
  const suppliedToken =
    request.headers.get("authorization");

  if (
    !expectedToken ||
    suppliedToken !== `Bearer ${expectedToken}`
  ) {
    return NextResponse.json(
  {
    error: "Unauthorized",
    tokenConfigured: Boolean(expectedToken),
	diagnosticVersion: "balance-check-v2",
    authorizationHeaderReceived: Boolean(suppliedToken),
    bearerPrefixReceived:
      suppliedToken?.startsWith("Bearer ") ?? false,
  },
  { status: 401 },
);
  }

  try {
    const secretKey = getPaystackSecretKey();

const response = await fetch(
  "https://api.paystack.co/balance",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  },
);
      

    return NextResponse.json({
      reachable: true,
      httpStatus: response.status,
      contentType:
        response.headers.get("content-type"),
      cloudflareRayId:
        response.headers.get("cf-ray"),
    });
  } catch (error) {
    return NextResponse.json(
      {
        reachable: false,
        error:
          error instanceof Error
            ? error.message
            : "Connection failed",
      },
      { status: 502 },
    );
	
  }
}
