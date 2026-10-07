import type {
  BillingCycle,
  SubscriptionPlan,
} from "@/generated/prisma/client";
import {
  getSubscriptionPlanDefinition,
  type BillingCurrency,
} from "@/lib/subscription/subscriptionPlanCatalog";

export interface SubscriptionPriceInput {
  plan: SubscriptionPlan;
  currency: BillingCurrency;
  billingCycle: BillingCycle;
}

export function getSubscriptionPrice(
  input: SubscriptionPriceInput,
): number {
  const definition = getSubscriptionPlanDefinition(input.plan);

  if (definition.isTrial) {
    throw new Error("The free trial does not have a paid subscription price.");
  }

  const pricing = definition.pricing[input.currency];

  if (!pricing) {
    throw new Error(
      `Currency ${input.currency} is not supported for the ${input.plan} plan.`,
    );
  }

  const amount =
    input.billingCycle === "MONTHLY"
      ? pricing.monthly
      : pricing.annual;

  if (amount === null || amount === undefined) {
    throw new Error(
      `No ${input.billingCycle.toLowerCase()} price is configured for the ${input.plan} plan in ${input.currency}.`,
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      `Invalid ${input.billingCycle.toLowerCase()} price configured for the ${input.plan} plan in ${input.currency}.`,
    );
  }

  return amount;
}