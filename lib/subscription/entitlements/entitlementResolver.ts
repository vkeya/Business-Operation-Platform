import type { BusinessType } from "@/types";
import type { SubscriptionPlan } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import {
  entitlementDefinitions,
  type EntitlementCode,
  type EntitlementDefinition,
} from "./entitlementDefinitions";

const planRank: Record<SubscriptionPlan, number> = {
  FREE_TRIAL: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  BUSINESS: 3,
};

export interface EntitlementResolution {
  granted: boolean;
  code: EntitlementCode;
  definition: EntitlementDefinition;
  plan: SubscriptionPlan;
  businessType: BusinessType;
  reason:
    | "GRANTED"
    | "NO_SUBSCRIPTION"
    | "SUBSCRIPTION_INACTIVE"
    | "PLAN_TOO_LOW"
    | "ADD_ON_REQUIRED"
    | "BUSINESS_TYPE_NOT_SUPPORTED"
    | "TRIAL_EXCLUDED";
}

export function planIncludesEntitlement(
  plan: SubscriptionPlan,
  definition: EntitlementDefinition,
): boolean {
  return planRank[plan] >= planRank[definition.minimumPlan];
}

export function resolveEntitlementFromSubscription(
  input: {
    plan: SubscriptionPlan;
    businessType: BusinessType;
    code: EntitlementCode;
    isTrialActive: boolean;
    hasActiveAddOn?: boolean;
  },
): EntitlementResolution {
  const definition = entitlementDefinitions[input.code];

  if (!definition) {
    throw new Error(`Unknown subscription entitlement: ${input.code}.`);
  }

  if (input.isTrialActive && !definition.includedInTrial) {
    return {
      granted: false,
      code: input.code,
      definition,
      plan: input.plan,
      businessType: input.businessType,
      reason: "TRIAL_EXCLUDED",
    };
  }


  if (
    definition.addOnCode &&
    input.plan !== "BUSINESS" &&
    input.hasActiveAddOn !== true
  ) {
    return {
      granted: false,
      code: input.code,
      definition,
      plan: input.plan,
      businessType: input.businessType,
      reason: "ADD_ON_REQUIRED",
    };
  }

  const trialEntitlementGranted =
    input.isTrialActive && definition.includedInTrial;

  if (
    !trialEntitlementGranted &&
    !planIncludesEntitlement(input.plan, definition)
  ) {
    return {
      granted: false,
      code: input.code,
      definition,
      plan: input.plan,
      businessType: input.businessType,
      reason: "PLAN_TOO_LOW",
    };
  }

  if (
    definition.requiredBusinessTypes &&
    !definition.requiredBusinessTypes.includes(input.businessType)
  ) {
    return {
      granted: false,
      code: input.code,
      definition,
      plan: input.plan,
      businessType: input.businessType,
      reason: "BUSINESS_TYPE_NOT_SUPPORTED",
    };
  }

  return {
    granted: true,
    code: input.code,
    definition,
    plan: input.plan,
    businessType: input.businessType,
    reason: "GRANTED",
  };
}

export async function resolveBusinessEntitlement(
  businessId: string,
  code: EntitlementCode,
): Promise<EntitlementResolution> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: {
      addOns: {
        where: {
          status: "ACTIVE",
          OR: [
            { endedAt: null },
            { endedAt: { gt: new Date() } },
          ],
        },
        select: {
          addOnCode: true,
        },
      },
    },
  });

  if (!subscription) {
    const definition = entitlementDefinitions[code];
    throw new Error(
      `Cannot resolve entitlement ${definition.name}: business has no subscription.`,
    );
  }

  const now = new Date();
  const isTrialActive =
    subscription.status === "TRIALING" &&
    !!subscription.trialEndsAt &&
    subscription.trialEndsAt > now;

  if (
    subscription.status !== "ACTIVE" &&
    !isTrialActive
  ) {
    const definition = entitlementDefinitions[code];

    return {
      granted: false,
      code,
      definition,
      plan: subscription.plan,
      businessType: await getBusinessType(businessId),
      reason: "SUBSCRIPTION_INACTIVE",
    };
  }

  const businessType = await getBusinessType(businessId);
  const definition = entitlementDefinitions[code];

  if (!definition) {
    throw new Error(`Unknown subscription entitlement: ${code}.`);
  }

  const hasActiveAddOn = definition.addOnCode
    ? subscription.addOns.some(
        (addOn) => addOn.addOnCode === definition.addOnCode,
      )
    : false;

  return resolveEntitlementFromSubscription({
    plan: subscription.plan,
    businessType,
    code,
    isTrialActive,
    hasActiveAddOn,
  });
}

async function getBusinessType(
  businessId: string,
): Promise<BusinessType> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { type: true },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  return business.type as BusinessType;
}

export async function hasBusinessEntitlement(
  businessId: string,
  code: EntitlementCode,
): Promise<boolean> {
  const result = await resolveBusinessEntitlement(
    businessId,
    code,
  );

  return result.granted;
}
