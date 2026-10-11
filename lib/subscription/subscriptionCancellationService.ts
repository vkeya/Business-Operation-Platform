import { prisma } from "@/lib/database/prisma";

export type SubscriptionCancellationResult = {
  businessId: string;
  status: "ACTIVE" | "TRIALING" | "EXPIRED" | "CANCELLED";
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
};

function assertBusinessId(businessId: string): void {
  if (!businessId.trim()) {
    throw new Error("Business context is required.");
  }
}

export async function scheduleSubscriptionCancellation(
  businessId: string,
): Promise<SubscriptionCancellationResult> {
  assertBusinessId(businessId);

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: { businessId },
          select: {
            id: true,
            businessId: true,
            status: true,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("No subscription found for this business.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Only ACTIVE subscriptions can be cancelled. Current status: ${subscription.status}.`,
        );
      }

      if (
        !subscription.currentPeriodEnd ||
        subscription.currentPeriodEnd <= new Date()
      ) {
        throw new Error(
          "The subscription period has already ended.",
        );
      }

      if (!subscription.cancelAtPeriodEnd) {
        await tx.businessSubscription.update({
          where: { id: subscription.id },
          data: {
            cancelAtPeriodEnd: true,
          },
        });
      }

      return {
        businessId: subscription.businessId,
        status: subscription.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function undoSubscriptionCancellation(
  businessId: string,
): Promise<SubscriptionCancellationResult> {
  assertBusinessId(businessId);

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: { businessId },
          select: {
            id: true,
            businessId: true,
            status: true,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("No subscription found for this business.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Only ACTIVE subscriptions can have cancellation undone. Current status: ${subscription.status}.`,
        );
      }

      if (
        !subscription.currentPeriodEnd ||
        subscription.currentPeriodEnd <= new Date()
      ) {
        throw new Error(
          "The subscription period has already ended.",
        );
      }

      if (subscription.cancelAtPeriodEnd) {
        await tx.businessSubscription.update({
          where: { id: subscription.id },
          data: {
            cancelAtPeriodEnd: false,
          },
        });
      }

      return {
        businessId: subscription.businessId,
        status: subscription.status,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}