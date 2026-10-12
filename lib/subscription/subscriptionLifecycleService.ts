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

      // Guard the transition against a concurrent renewal or cancellation
      // after the subscription was read above.
      const updated = await tx.businessSubscription.updateMany({
        where: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          ...(subscription.status === "TRIALING"
            ? { trialEndsAt: { lte: now } }
            : { currentPeriodEnd: { lte: now } }),
        },
        data: {
          status: nextStatus,
          endedAt: now,
          nextBillingDate: null,
        },
      });

      if (updated.count === 0) {
        const current = await tx.businessSubscription.findUnique({
          where: { id: subscription.id },
          select: { status: true },
        });
        return {
          processed: false,
          previousStatus: subscription.status,
          status: current?.status ?? subscription.status,
          expiredAddOns: 0,
        };
      }

      const expiredAddOns = await expireActiveAddOns(
        tx,
        subscription.id,
        now,
      );

      return {
        processed: true,
        previousStatus: subscription.status,
        status: nextStatus,
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
            trialEndsAt: true,
            currentPeriodEnd: true,
          },
        });

      let processed = 0;
      let expired = 0;
      let cancelled = 0;
      let expiredAddOns = 0;

      for (const subscription of dueSubscriptions) {
        const nextStatus =
          subscription.status === "ACTIVE" &&
          subscription.cancelAtPeriodEnd
            ? "CANCELLED"
            : "EXPIRED";

        // Guard the transition against a concurrent renewal or cancellation
        // update after the due-subscription query ran.
        const updated = await tx.businessSubscription.updateMany({
          where: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            ...(subscription.status === "TRIALING"
              ? { trialEndsAt: { lte: now } }
              : { currentPeriodEnd: { lte: now } }),
          },
          data: {
            status: nextStatus,
            endedAt: now,
            nextBillingDate: null,
          },
        });

        if (updated.count === 0) {
          continue;
        }

        processed += 1;

        expiredAddOns += await expireActiveAddOns(
          tx,
          subscription.id,
          now,
        );

        if (nextStatus === "CANCELLED") {
          cancelled += 1;
        } else {
          expired += 1;
        }
      }

      return {
        processed,
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
