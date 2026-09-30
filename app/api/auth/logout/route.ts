import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";

export async function POST(request: Request) {
  try {
    const session =
      await getServerSession(authOptions);

    if (session?.user?.id) {
      const ipAddress =
        request.headers
          .get("x-forwarded-for")
          ?.split(",")[0]
          ?.trim() ||
        request.headers.get("x-real-ip");

      const userAgent =
        request.headers.get("user-agent");

      await recordAuditEvent({
        actorId: session.user.id,

        action: AUDIT_ACTIONS.AUTH_LOGOUT,

        category: "AUTH",
        severity: "INFO",
        outcome: "SUCCESS",

        entityType: "User",
        entityId: session.user.id,

        ipAddress,
        userAgent,

        metadata: {
          method: "nextauth",
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Logout audit error:",
      error,
    );

    /*
     * Logout should still be allowed even if
     * audit recording fails.
     */
    return NextResponse.json({
      success: true,
    });
  }
}