import { prisma } from "@/lib/database/prisma";
import { queryAuditEvents } from "@/lib/audit/auditQueryService";

export interface AdminActivityDashboard {
  summary: {
    eventsToday: number;
    successful: number;
    warnings: number;
    errors: number;
    critical: number;
  };

  recentActivity: Awaited<
    ReturnType<typeof queryAuditEvents>
  >["events"];

  activityLog: Awaited<
    ReturnType<typeof queryAuditEvents>
  >;
}

export async function getAdminActivityDashboard(
  businessId: string,
): Promise<AdminActivityDashboard> {
  const normalizedBusinessId = businessId.trim();

  if (!normalizedBusinessId) {
    throw new Error("Business ID is required.");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    eventsToday,
    successful,
    warnings,
    errors,
    critical,
    recentActivityResult,
    activityLog,
  ] = await Promise.all([
    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        createdAt: {
          gte: startOfToday,
        },
        outcome: "SUCCESS",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        createdAt: {
          gte: startOfToday,
        },
        severity: "WARNING",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        createdAt: {
          gte: startOfToday,
        },
        severity: "ERROR",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        createdAt: {
          gte: startOfToday,
        },
        severity: "CRITICAL",
      },
    }),

    queryAuditEvents({
      businessId: normalizedBusinessId,
      page: 1,
      pageSize: 10,
    }),

    queryAuditEvents({
      businessId: normalizedBusinessId,
      page: 1,
      pageSize: 50,
    }),
  ]);

  return {
    summary: {
      eventsToday,
      successful,
      warnings,
      errors,
      critical,
    },

    recentActivity:
      recentActivityResult.events,

    activityLog,
  };
}