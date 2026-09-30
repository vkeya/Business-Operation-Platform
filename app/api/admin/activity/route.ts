import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { queryAuditEvents } from "@/lib/audit/auditQueryService";
import { getAdminActivityDashboard } from "@/lib/admin/adminActivityService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      session.user.id,
      context.business.id,
      "audit.read",
    );

    const { searchParams } =
      new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? "1") || 1,
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number(
          searchParams.get("pageSize") ?? "50",
        ) || 50,
      ),
    );

    const action =
      searchParams.get("action") || undefined;

    const category =
      searchParams.get("category") || undefined;

    const severity =
      searchParams.get("severity") || undefined;

    const outcome =
      searchParams.get("outcome") || undefined;

    const actorId =
      searchParams.get("actorId") || undefined;

    const entityType =
      searchParams.get("entityType") || undefined;

    const entityId =
      searchParams.get("entityId") || undefined;

    const search =
      searchParams.get("search") || undefined;

    /*
     * The ActivityLog component performs its own
     * paginated/filterable request.
     *
     * Therefore the API must return events and
     * pagination at the top level.
     */
    const activityLog =
      await queryAuditEvents({
        businessId: context.business.id,
        page,
        pageSize,
        action,
        category: category as any,
        severity: severity as any,
        outcome: outcome as any,
        actorId,
        entityType,
        entityId,
        search,
      });

    /*
     * Preserve the dashboard summary/recent activity
     * for the admin page.
     *
     * We only need this on the first unfiltered request.
     */
    const includeDashboard =
      page === 1 &&
      !action &&
      !category &&
      !severity &&
      !outcome &&
      !actorId &&
      !entityType &&
      !entityId &&
      !search;

    if (includeDashboard) {
      const dashboard =
        await getAdminActivityDashboard(
          context.business.id,
        );

		console.log(
  "[ADMIN ACTIVITY API]",
  JSON.stringify({
    businessId: context.business.id,
    page,
    pageSize,
    search,
    category,
    severity,
    outcome,
    eventCount: activityLog.events.length,
    total: activityLog.pagination.total,
  }),
);

      return NextResponse.json({
        summary: dashboard.summary,
        recentActivity:
          dashboard.recentActivity,

        events: activityLog.events,
        pagination: activityLog.pagination,

        activityLog,
      });
    }

    return NextResponse.json({
      events: activityLog.events,
      pagination: activityLog.pagination,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "statusCode" in error &&
      error.statusCode === 403
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 403,
        },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to retrieve admin activity.",
      },
      {
        status: 500,
      },
    );
  }
}