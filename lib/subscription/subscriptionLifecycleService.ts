import { prisma } from "@/lib/database/prisma";

export async function processDueSubscriptions() {
  const now = new Date();

  return prisma.$transaction(
    async (tx) => {
      const dueSubscriptions =
        await tx.businessSubscription.findMany({
          where: {
            status: "ACTIVE",
            currentPeriodEnd: {
              lte: now,
            },
          },
          select: {
            id: true,
            businessId: true,
            status: true,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
          },
        });

      const results = [];

      for (const subscription of dueSubscriptions) {
        if (!subscription.currentPeriodEnd) {
          continue;
        }

        const nextStatus =
          subscription.cancelAtPeriodEnd
            ? "CANCELLED"
            : "EXPIRED";

        const updated =
          await tx.businessSubscription.update({
            where: {
              id: subscription.id,
            },
            data: {
              status: nextStatus,
              endedAt: subscription.currentPeriodEnd,
            },
          });

        results.push(updated);
      }

      return results;
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function cancelSubscriptionAtPeriodEnd(
  businessId: string,
) {
  if (!businessId.trim()) {
    throw new Error("Business context is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            businessId,
          },
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("Billing subscription not found.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Only an active subscription can be cancelled. Current status: ${subscription.status}.`,
        );
      }

      if (!subscription.currentPeriodEnd) {
        throw new Error(
          "Active subscription does not have a current billing period.",
        );
      }

      if (subscription.cancelAtPeriodEnd) {
        return subscription;
      }

      return tx.businessSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function resumeSubscription(
  businessId: string,
) {
  if (!businessId.trim()) {
    throw new Error("Business context is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            businessId,
          },
          select: {
            id: true,
            status: true,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("Billing subscription not found.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Only an active subscription can be resumed. Current status: ${subscription.status}.`,
        );
      }

      if (!subscription.currentPeriodEnd) {
        throw new Error(
          "Active subscription does not have a current billing period.",
        );
      }

      if (!subscription.cancelAtPeriodEnd) {
        return subscription;
      }

      if (subscription.currentPeriodEnd <= new Date()) {
        throw new Error(
          "The subscription period has already ended.",
        );
      }

      return tx.businessSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          cancelAtPeriodEnd: false,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}