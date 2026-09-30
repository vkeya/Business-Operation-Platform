import { prisma } from "@/lib/database/prisma";

export interface AdminActivitySummary {
  total: number;
  successful: number;
  failed: number;
  denied: number;
  warnings: number;
  errors: number;
  critical: number;
}

export async function getAdminActivitySummary(
  businessId: string,
): Promise<AdminActivitySummary> {
  const normalizedBusinessId = businessId.trim();

  if (!normalizedBusinessId) {
    throw new Error("Business ID is required.");
  }

  const [
    total,
    successful,
    failed,
    denied,
    warnings,
    errors,
    critical,
  ] = await Promise.all([
    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        outcome: "SUCCESS",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        outcome: "FAILED",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        outcome: "DENIED",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        severity: "WARNING",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        severity: "ERROR",
      },
    }),

    prisma.auditEvent.count({
      where: {
        businessId: normalizedBusinessId,
        severity: "CRITICAL",
      },
    }),
  ]);

  return {
    total,
    successful,
    failed,
    denied,
    warnings,
    errors,
    critical,
  };
}