import { prisma } from "@/lib/database/prisma";
import {
  resolveBusinessEntitlement,
  type EntitlementResolution,
} from "./entitlements/entitlementResolver";

export type { EntitlementResolution } from "./entitlements/entitlementResolver";
import type { EntitlementCode } from "./entitlements/entitlementDefinitions";

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

export async function getEntitlement(
  businessId: string,
  code: EntitlementCode,
): Promise<EntitlementResolution> {
  return resolveBusinessEntitlement(
    businessId,
    code,
  );
}

export async function hasEntitlement(
  businessId: string,
  code: EntitlementCode,
): Promise<boolean> {
  const result = await getEntitlement(
    businessId,
    code,
  );

  return result.granted;
}

export async function requireEntitlement(
  businessId: string,
  code: EntitlementCode,
): Promise<EntitlementResolution> {
  const result = await getEntitlement(
    businessId,
    code,
  );

  if (result.granted) {
    return result;
  }

  const messages: Record<
    EntitlementResolution["reason"],
    string
  > = {
    GRANTED: "",
    NO_SUBSCRIPTION:
      "This business does not have an active subscription.",
    SUBSCRIPTION_INACTIVE:
      "This business does not have an active subscription.",
    PLAN_TOO_LOW:
      `The ${result.definition.name} feature requires a higher subscription plan.`,
    ADD_ON_REQUIRED:
      `The ${result.definition.name} feature requires an active subscription add-on.`,
    BUSINESS_TYPE_NOT_SUPPORTED:
      `The ${result.definition.name} feature is not available for this business type.`,
    TRIAL_EXCLUDED:
      `The ${result.definition.name} feature is not included in the free trial.`,
  };

  throw new SubscriptionEntitlementError(
    messages[result.reason],
  );
}

/**
 * Supermarket Autopilot recommendations are available to:
 * - Business plan through SUPERMARKET_AUTOPILOT
 * - Professional plan with the AUTOPILOT_LITE add-on
 *
 * AUTOPILOT_ASSISTED and AUTOPILOT_ADVANCED are intentionally
 * not checked here because the current API only manages
 * recommendation lifecycle; it does not yet execute business
 * actions autonomously.
 */
export async function requireSupermarketAutopilotEntitlement(
  businessId: string,
): Promise<EntitlementResolution> {
  const supermarketAutopilot =
    await getEntitlement(
      businessId,
      "SUPERMARKET_AUTOPILOT",
    );

  if (supermarketAutopilot.granted) {
    return supermarketAutopilot;
  }

  const autopilotLite =
    await getEntitlement(
      businessId,
      "AUTOPILOT_LITE",
    );

  if (autopilotLite.granted) {
    return autopilotLite;
  }

  if (
    supermarketAutopilot.reason === "SUBSCRIPTION_INACTIVE" ||
    supermarketAutopilot.reason === "NO_SUBSCRIPTION"
  ) {
    throw new SubscriptionEntitlementError(
      "This business does not have an active subscription.",
    );
  }

  if (autopilotLite.reason === "ADD_ON_REQUIRED") {
    throw new SubscriptionEntitlementError(
      "Supermarket Autopilot requires the Business plan or an active Autopilot Lite add-on.",
    );
  }

  throw new SubscriptionEntitlementError(
    `The ${supermarketAutopilot.definition.name} feature requires a higher subscription plan or an active Autopilot Lite add-on.`,
  );
}
