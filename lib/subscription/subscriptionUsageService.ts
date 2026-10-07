import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;
import type { SubscriptionLimit } from "./subscriptionPlanCatalog";

export interface SubscriptionUsage {
  limit: SubscriptionLimit;
  currentUsage: number;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface SubscriptionUsagePeriod {
  start: Date;
  end: Date;
}

/**
 * Returns the current calendar-month usage window for transaction limits.
 * The application stores timestamps as DateTime; this service uses UTC
 * boundaries so the same deterministic period is used by every caller.
 */
export function getCurrentUsagePeriod(
  now = new Date(),
): SubscriptionUsagePeriod {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return { start, end };
}

/**
 * Returns measured database usage for a subscription limit.
 * Storage is intentionally not measured here until SmatPic has a canonical
 * storage accounting source; the catalog limit remains configuration-only.
 */
export async function getSubscriptionUsage(
  businessId: string,
  limit: SubscriptionLimit,
  client: PrismaTransactionClient = prisma,
): Promise<SubscriptionUsage> {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  switch (limit) {
    case "users": {
      const currentUsage = await client.businessMembership.count({
        where: {
          businessId,
          isActive: true,
        },
      });

      return { limit, currentUsage };
    }

    case "branches": {
      const currentUsage = await client.branch.count({
        where: {
          businessId,
          isActive: true,
        },
      });

      return { limit, currentUsage };
    }

    case "warehouses": {
      const currentUsage = await client.warehouse.count({
        where: {
          businessId,
          isActive: true,
        },
      });

      return { limit, currentUsage };
    }

    case "products": {
      const currentUsage = await client.product.count({
        where: {
          businessId,
        },
      });

      return { limit, currentUsage };
    }

    case "monthly_sales_transactions": {
      const { start, end } = getCurrentUsagePeriod();
      const currentUsage = await client.sale.count({
        where: {
          businessId,
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });

      return {
        limit,
        currentUsage,
        periodStart: start,
        periodEnd: end,
      };
    }

    case "monthly_purchase_transactions": {
      const { start, end } = getCurrentUsagePeriod();
      const currentUsage = await client.purchase.count({
        where: {
          businessId,
          status: "RECEIVED",
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });

      return {
        limit,
        currentUsage,
        periodStart: start,
        periodEnd: end,
      };
    }

    case "storage_gb":
      throw new Error(
        "Storage usage is not yet measurable because SmatPic has no canonical storage metering source.",
      );
  }
}
