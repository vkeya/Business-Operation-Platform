import { prisma } from "@/lib/database/prisma";

export class SubscriptionEntitlementError extends Error {
  readonly statusCode = 402;

  constructor(message: string) {
    super(message);
    this.name = "SubscriptionEntitlementError";
  }
}

export async function getBusinessSubscription(
  businessId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return prisma.businessSubscription.findUnique({
    where: {
      businessId,
    },
  });
}

export async function requireBusinessEntitlement(
  businessId: string,
) {
  const subscription =
    await getBusinessSubscription(businessId);

  if (!subscription) {
    throw new SubscriptionEntitlementError(
      "This business does not have an active subscription.",
    );
  }

  const now = new Date();

  if (subscription.status === "ACTIVE") {
    return subscription;
  }

  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt > now
  ) {
    return subscription;
  }

  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt <= now
  ) {
    throw new SubscriptionEntitlementError(
      "Your free trial has expired.",
    );
  }

  if (subscription.status === "EXPIRED") {
    throw new SubscriptionEntitlementError(
      "Your subscription has expired.",
    );
  }

  if (subscription.status === "CANCELLED") {
    throw new SubscriptionEntitlementError(
      "Your subscription has been cancelled.",
    );
  }

  throw new SubscriptionEntitlementError(
    "This business does not have an active subscription.",
  );
}