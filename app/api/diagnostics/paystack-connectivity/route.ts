
import { NextResponse } from "next/server";

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
    authorizationHeaderReceived: Boolean(suppliedToken),
    bearerPrefixReceived:
      suppliedToken?.startsWith("Bearer ") ?? false,
  },
  { status: 401 },
);
  }

  try {
    const secretKey =
  process.env.SMATPIC_PAYSTACK_SECRET_KEY;

if (!secretKey) {
  return NextResponse.json(
    { error: "Paystack secret key is not configured" },
    { status: 503 },
  );
}

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
