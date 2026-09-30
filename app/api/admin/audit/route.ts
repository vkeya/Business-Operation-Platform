import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { authOptions } from "@/lib/auth/auth";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { queryAuditEvents } from "@/lib/audit/auditQueryService";
import type {
  AuditCategory,
  AuditOutcome,
  AuditSeverity,
} from "@/lib/audit/auditTypes";

const AUDIT_CATEGORIES = [
  "AUTH",
  "USER",
  "BUSINESS",
  "INVENTORY",
  "SALES",
  "PURCHASES",
  "ACCOUNTING",
  "PAYMENTS",
  "ETIMS",
  "PHARMACY",
  "ADMIN",
  "SECURITY",
  "SYSTEM",
] as const satisfies readonly AuditCategory[];

const AUDIT_SEVERITIES = [
  "INFO",
  "WARNING",
  "ERROR",
  "CRITICAL",
] as const satisfies readonly AuditSeverity[];

const AUDIT_OUTCOMES = [
  "SUCCESS",
  "FAILED",
  "DENIED",
] as const satisfies readonly AuditOutcome[];

function parseDate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
}

function parseEnum<T extends readonly string[]>(
  value: string | null,
  allowed: T,
  fieldName: string,
): T[number] | undefined {
  if (!value) {
    return undefined;
  }

  if (!allowed.includes(value)) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }

  return value as T[number];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      session.user.id,
      context.business.id,
      "audit.read",
    );

    const searchParams = request.nextUrl.searchParams;

    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "50");

    if (!Number.isInteger(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid pageSize. It must be between 1 and 100.",
        },
        { status: 400 },
      );
    }

    const category = parseEnum(
      searchParams.get("category"),
      AUDIT_CATEGORIES,
      "category",
    );

    const severity = parseEnum(
      searchParams.get("severity"),
      AUDIT_SEVERITIES,
      "severity",
    );

    const outcome = parseEnum(
      searchParams.get("outcome"),
      AUDIT_OUTCOMES,
      "outcome",
    );

    const result = await queryAuditEvents({
      businessId: context.business.id,

      page,
      pageSize,

      action: searchParams.get("action") ?? undefined,
      category,
      severity,
      outcome,

      actorId: searchParams.get("actorId") ?? undefined,
      entityType:
        searchParams.get("entityType") ?? undefined,
      entityId:
        searchParams.get("entityId") ?? undefined,

      search:
        searchParams.get("search") ?? undefined,

      from: parseDate(searchParams.get("from")),
      to: parseDate(searchParams.get("to")),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      "statusCode" in error &&
      error.statusCode === 403
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to retrieve audit events.",
      },
      { status: 500 },
    );
  }
}