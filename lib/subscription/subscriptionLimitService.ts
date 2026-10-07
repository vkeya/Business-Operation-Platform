import { prisma } from "@/lib/database/prisma";
import type { SubscriptionPlan } from "@/generated/prisma/client";
import {
  getSubscriptionPlanDefinition,
  type SubscriptionLimit,
} from "./subscriptionPlanCatalog";
import {
  requireBusinessEntitlement,
  SubscriptionEntitlementError,
} from "./subscriptionEntitlementService";
import { getSubscriptionUsage } from "./subscriptionUsageService";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

const capacityAddOnMap = {
  users: "ADDITIONAL_USER",
  branches: "ADDITIONAL_BRANCH",
} as Partial<Record<SubscriptionLimit, string>>;

export interface SubscriptionLimitResolution {
  limit: SubscriptionLimit;
  plan: SubscriptionPlan;
  baseLimit: number | null;
  addOnCapacity: number;
  effectiveLimit: number | null;
  isUnlimited: boolean;
}

export class SubscriptionLimitError extends Error {
  readonly statusCode = 402;

  constructor(message: string) {
    super(message);
    this.name = "SubscriptionLimitError";
  }
}

function getBaseLimit(
  plan: SubscriptionPlan,
  limit: SubscriptionLimit,
): number | null {
  const definition = getSubscriptionPlanDefinition(plan);
  const configuredLimit = definition.limits[limit];

  if (configuredLimit === undefined) {
    throw new Error(
      `Subscription limit ${limit} is not configured for ${plan}.`,
    );
  }

  return configuredLimit;
}

function addCapacity(
  baseLimit: number | null,
  addOnCapacity: number,
): number | null {
  if (baseLimit === null) {
    return null;
  }

  return baseLimit + addOnCapacity;
}

export async function getSubscriptionLimit(
  businessId: string,
  limit: SubscriptionLimit,
  client: PrismaTransactionClient = prisma,
): Promise<SubscriptionLimitResolution> {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  const subscription =
    client === prisma
      ? await requireBusinessEntitlement(businessId)
      : await client.businessSubscription.findUnique({
          where: { businessId },
        });

  if (!subscription) {
    throw new SubscriptionEntitlementError(
      "This business does not have an active subscription.",
    );
  }

  const now = new Date();

  if (
    subscription.status !== "ACTIVE" &&
    !(
      subscription.status === "TRIALING" &&
      subscription.trialEndsAt &&
      subscription.trialEndsAt > now
    )
  ) {
    throw new SubscriptionEntitlementError(
      "This business does not have an active subscription.",
    );
  }
  const baseLimit = getBaseLimit(subscription.plan, limit);
  const addOnCode = capacityAddOnMap[limit];

  if (!addOnCode || baseLimit === null) {
    return {
      limit,
      plan: subscription.plan,
      baseLimit,
      addOnCapacity: 0,
      effectiveLimit: baseLimit,
      isUnlimited: baseLimit === null,
    };
  }

  const activeAddOn = await client.businessSubscriptionAddOn.findFirst({
    where: {
      businessSubscriptionId: subscription.id,
      addOnCode,
      status: "ACTIVE",
      startedAt: { lte: now },
      OR: [{ endedAt: null }, { endedAt: { gt: now } }],
    },
    select: {
      quantity: true,
    },
  });

  const addOnCapacity = activeAddOn?.quantity ?? 0;
  const effectiveLimit = addCapacity(baseLimit, addOnCapacity);

  return {
    limit,
    plan: subscription.plan,
    baseLimit,
    addOnCapacity,
    effectiveLimit,
    isUnlimited: effectiveLimit === null,
  };
}

export async function requireWithinSubscriptionLimit(input: {
  businessId: string;
  limit: SubscriptionLimit;
  additionalUnits?: number;
  client?: PrismaTransactionClient;
}): Promise<SubscriptionLimitResolution> {
  const additionalUnits = input.additionalUnits ?? 1;

  if (!Number.isInteger(additionalUnits) || additionalUnits < 1) {
    throw new Error("additionalUnits must be a positive integer.");
  }

  const client = input.client ?? prisma;

  const resolution = await getSubscriptionLimit(
    input.businessId,
    input.limit,
    client,
  );

  if (resolution.isUnlimited) {
    return resolution;
  }

  const usage = await getSubscriptionUsage(
    input.businessId,
    input.limit,
    client,
  );

  const projectedUsage = usage.currentUsage + additionalUnits;

  if (projectedUsage <= resolution.effectiveLimit!) {
    return resolution;
  }

  const remaining = Math.max(
    resolution.effectiveLimit! - usage.currentUsage,
    0,
  );

  throw new SubscriptionLimitError(
    `The ${input.limit} limit has been reached. Current usage is ${usage.currentUsage} of ${resolution.effectiveLimit}. ${remaining} unit(s) remain available.`,
  );
}

export { capacityAddOnMap };
