import type { SubscriptionPlan } from "@/generated/prisma/client";

export type SubscriptionFeature =
  | "dashboard"
  | "inventory"
  | "sales"
  | "pos"
  | "customers"
  | "suppliers"
  | "purchases"
  | "payments"
  | "expenses"
  | "reports"
  | "accounting"
  | "advanced_reports"
  | "business_intelligence"
  | "advanced_automation"
  | "autopilot"
  | "multi_location"
  | "api_integrations"
  | "vertical_intelligence";

export type SubscriptionLimit =
  | "users"
  | "branches"
  | "warehouses"
  | "products"
  | "monthly_sales_transactions"
  | "monthly_purchase_transactions"
  | "storage_gb";

export interface SubscriptionPlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  trialDays: number | null;
  isTrial: boolean;
  pricing: Record<BillingCurrency, SubscriptionPlanPricing>;
  features: SubscriptionFeature[];
  limits: Partial<Record<SubscriptionLimit, number | null>>;
}

export type BillingCurrency = "KES" | "USD";

export interface SubscriptionPlanPricing {
  monthly: number | null;
  annual: number | null;
}

export const subscriptionPlanCatalog: Record<
  SubscriptionPlan,
  SubscriptionPlanDefinition
> = {
  FREE_TRIAL: {
    plan: "FREE_TRIAL",
    name: "14-Day Free Trial",
    description:
      "Full access to SmatPic Professional intelligence during the 14-day trial, excluding advanced execution and executive features.",
    trialDays: 14,
    isTrial: true,
    pricing: {
      KES: { monthly: null, annual: null },
      USD: { monthly: null, annual: null },
    },
    features: [
      "dashboard",
      "inventory",
      "sales",
      "pos",
      "customers",
      "suppliers",
      "purchases",
      "payments",
      "expenses",
      "reports",
      "accounting",
      "advanced_reports",
      "business_intelligence",
      "vertical_intelligence",
      "autopilot",
    ],
    limits: {
      users: 5,
      branches: 2,
      warehouses: 3,
      products: 10_000,
      monthly_sales_transactions: null,
      monthly_purchase_transactions: null,
      storage_gb: 5,
    },
  },

  STARTER: {
    plan: "STARTER",
    name: "Starter",
    description:
      "Core business operations for small and growing businesses.",
    trialDays: null,
    isTrial: false,
    pricing: {
      KES: { monthly: 2500, annual: 25000 },
      USD: { monthly: 20, annual: 200 },
    },
    features: [
      "dashboard",
      "inventory",
      "sales",
      "pos",
      "customers",
      "suppliers",
      "purchases",
      "payments",
      "expenses",
      "reports",
    ],
    limits: {
      users: 3,
      branches: 1,
      warehouses: 1,
      products: 1_000,
      monthly_sales_transactions: 2_000,
      monthly_purchase_transactions: 1_000,
      storage_gb: 2,
    },
  },

  PROFESSIONAL: {
    plan: "PROFESSIONAL",
    name: "Professional",
    description:
      "Advanced business operations and intelligence for growing businesses.",
    trialDays: null,
    isTrial: false,
    pricing: {
      KES: { monthly: 5000, annual: 50000 },
      USD: { monthly: 40, annual: 400 },
    },
    features: [
      "dashboard",
      "inventory",
      "sales",
      "pos",
      "customers",
      "suppliers",
      "purchases",
      "payments",
      "expenses",
      "reports",
      "accounting",
      "advanced_reports",
      "business_intelligence",
      "vertical_intelligence",
    ],
    limits: {
      users: 10,
      branches: 5,
      warehouses: 5,
      products: 10_000,
      monthly_sales_transactions: 10_000,
      monthly_purchase_transactions: 5_000,
      storage_gb: 20,
    },
  },

  BUSINESS: {
    plan: "BUSINESS",
    name: "Business",
    description:
      "Advanced capabilities for larger and multi-location businesses.",
    trialDays: null,
    isTrial: false,
    pricing: {
      KES: { monthly: 10000, annual: 100000 },
      USD: { monthly: 80, annual: 800 },
    },
    features: [
      "dashboard",
      "inventory",
      "sales",
      "pos",
      "customers",
      "suppliers",
      "purchases",
      "payments",
      "expenses",
      "reports",
      "accounting",
      "advanced_reports",
      "business_intelligence",
      "advanced_automation",
      "autopilot",
      "multi_location",
      "api_integrations",
      "vertical_intelligence",
    ],
    limits: {
      users: null,
      branches: null,
      warehouses: null,
      products: null,
      monthly_sales_transactions: null,
      monthly_purchase_transactions: null,
      storage_gb: 100,
    },
  },
};

export function getSubscriptionPlanDefinition(
  plan: SubscriptionPlan,
): SubscriptionPlanDefinition {
  return subscriptionPlanCatalog[plan];
}
