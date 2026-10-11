import { prisma } from "@/lib/database/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type SubscriptionLifecycleResult = {
  processed: boolean;
  previousStatus: "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  status: "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  expiredAddOns: number;
};

function assertBusinessId(businessId: string): void {
  if (!businessId.trim()) {
    throw new Error("Business context is required.");
  }
}

async function expireActiveAddOns(
  tx: Prisma.TransactionClient,
  subscriptionId: string,
  endedAt: Date,
): Promise<number> {
  const result = await tx.businessSubscriptionAddOn.updateMany({
    where: {
      businessSubscriptionId: subscriptionId,
      status: "ACTIVE",
    },
    data: {
      status: "EXPIRED",
      endedAt,
    },
  });

  return result.count;
}

/**
 * Applies any lifecycle transition that is due for one subscription.
 *
 * This is intentionally idempotent: subscriptions that are already EXPIRED
 * or CANCELLED are left untouched, and only ACTIVE add-ons are expired when
 * the parent subscription transitions out of an active state.
 */
export async function processSubscriptionLifecycle(
  businessId: string,
  now = new Date(),
): Promise<SubscriptionLifecycleResult | null> {
  assertBusinessId(businessId);

  return prisma.$transaction(
    async (tx) => {
      const subscription = await tx.businessSubscription.findUnique({
        where: {
          businessId,
        },
        select: {
          id: true,
          status: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      });

      if (!subscription) {
        return null;
      }

      let nextStatus: typeof subscription.status | null = null;

      if (
        subscription.status === "TRIALING" &&
        subscription.trialEndsAt &&
        subscription.trialEndsAt <= now
      ) {
        nextStatus = "EXPIRED";
      } else if (
        subscription.status === "ACTIVE" &&
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd <= now
      ) {
        nextStatus = subscription.cancelAtPeriodEnd
          ? "CANCELLED"
          : "EXPIRED";
      }

      if (!nextStatus) {
        return {
          processed: false,
          previousStatus: subscription.status,
          status: subscription.status,
          expiredAddOns: 0,
        };
      }

      const updatedSubscription = await tx.businessSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: nextStatus,
          endedAt: now,
          nextBillingDate: null,
        },
      });

      const expiredAddOns = await expireActiveAddOns(
        tx,
        subscription.id,
        now,
      );

      return {
        processed: true,
        previousStatus: subscription.status,
        status: updatedSubscription.status,
        expiredAddOns,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

/**
 * Processes every subscription whose trial or billing period has expired.
 *
 * This function is safe to run repeatedly from a future scheduler/worker.
 * It does not create renewal invoices or initiate payments; those remain
 * owned by the billing renewal flow.
 */
export async function processDueSubscriptions(
  now = new Date(),
): Promise<{
  processed: number;
  expired: number;
  cancelled: number;
  expiredAddOns: number;
}> {
  return prisma.$transaction(
    async (tx) => {
      const dueSubscriptions =
        await tx.businessSubscription.findMany({
          where: {
            OR: [
              {
                status: "TRIALING",
                trialEndsAt: {
                  lte: now,
                },
              },
              {
                status: "ACTIVE",
                currentPeriodEnd: {
                  lte: now,
                },
              },
            ],
          },
          select: {
            id: true,
            status: true,
            cancelAtPeriodEnd: true,
          },
        });

      let expired = 0;
      let cancelled = 0;
      let expiredAddOns = 0;

      for (const subscription of dueSubscriptions) {
        const nextStatus =
          subscription.status === "ACTIVE" &&
          subscription.cancelAtPeriodEnd
            ? "CANCELLED"
            : "EXPIRED";

        const updated = await tx.businessSubscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: nextStatus,
            endedAt: now,
            nextBillingDate: null,
          },
        });

        expiredAddOns += await expireActiveAddOns(
          tx,
          subscription.id,
          now,
        );

        if (updated.status === "CANCELLED") {
          cancelled += 1;
        } else {
          expired += 1;
        }
      }

      return {
        processed: dueSubscriptions.length,
        expired,
        cancelled,
        expiredAddOns,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}
