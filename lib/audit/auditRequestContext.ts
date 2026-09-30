import crypto from "crypto";

export interface AuditRequestContext {
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string;
  correlationId: string;
}

export function getAuditRequestContext(
  request: Request,
): AuditRequestContext {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const ipAddress =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const userAgent =
    request.headers.get("user-agent") || null;

  const requestId =
    request.headers.get("x-request-id") ||
    crypto.randomUUID();

  const correlationId =
    request.headers.get("x-correlation-id") ||
    requestId;

  return {
    ipAddress,
    userAgent,
    requestId,
    correlationId,
  };
}