import type { NextRequest } from "next/server";

export interface AuditRequestContext {
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  correlationId: string | null;
}

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim() || null;
}

export function getAuditRequestContext(
  request: NextRequest,
): AuditRequestContext {
  const requestId =
    request.headers.get("x-request-id") ??
    request.headers.get("x-vercel-id");

  const correlationId =
    request.headers.get("x-correlation-id") ??
    requestId;

  const forwardedFor = request.headers.get("x-forwarded-for");

  const ipAddress =
    firstHeaderValue(forwardedFor) ??
    request.headers.get("x-real-ip") ??
    null;

  const userAgent = request.headers.get("user-agent");

  return {
    ipAddress,
    userAgent,
    requestId,
    correlationId,
  };
}