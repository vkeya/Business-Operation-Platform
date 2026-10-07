import type { SubscriptionPlan } from "@/generated/prisma/client";

import {
  getSubscriptionPlanDefinition,
  type SubscriptionFeature,
  type SubscriptionLimit,
} from "@/lib/subscription/subscriptionPlanCatalog";

export function hasSubscriptionFeature(
  plan: SubscriptionPlan,
  feature: SubscriptionFeature,
): boolean {
  const definition = getSubscriptionPlanDefinition(plan);

  return definition.features.includes(feature);
}

export function getSubscriptionLimit(
  plan: SubscriptionPlan,
  limit: SubscriptionLimit,
): number | null | undefined {
  const definition = getSubscriptionPlanDefinition(plan);

  return definition.limits[limit];
}

export function isSubscriptionLimitExceeded(
  plan: SubscriptionPlan,
  limit: SubscriptionLimit,
  currentUsage: number,
): boolean {
  const maximum = getSubscriptionLimit(plan, limit);

  if (maximum === undefined || maximum === null) {
    return false;
  }

  return currentUsage >= maximum;
}