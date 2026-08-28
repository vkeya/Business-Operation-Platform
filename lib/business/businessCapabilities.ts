import type { BusinessType } from "@/types";

export type BusinessCapability =
  | "dashboard"
  | "inventory"
  | "purchases"
  | "sales"
  | "customers"
  | "suppliers"
  | "payments"
  | "expenses"
  | "accounting"
  | "reports"
  | "menu"
  | "services";

export const coreBusinessCapabilities: BusinessCapability[] = [
  "dashboard",
  "inventory",
  "purchases",
  "sales",
  "customers",
  "suppliers",
  "payments",
  "expenses",
  "accounting",
  "reports",
];

export const businessCapabilities: Record<
  BusinessType,
  BusinessCapability[]
> = {
  restaurant: [
    ...coreBusinessCapabilities,
    "menu",
  ],

  bar: [
    ...coreBusinessCapabilities,
  ],

  wines_spirits: [
    ...coreBusinessCapabilities,
  ],

  hotel: [
    ...coreBusinessCapabilities,
  ],

  hospital: [
    ...coreBusinessCapabilities,
  ],

  supermarket: [
    ...coreBusinessCapabilities,
  ],

  shop: [
    ...coreBusinessCapabilities,
  ],

  boutique: [
    ...coreBusinessCapabilities,
    "services",
  ],

  other: [
    ...coreBusinessCapabilities,
  ],
};

export function getBusinessCapabilities(
  businessType: BusinessType,
): BusinessCapability[] {
  return businessCapabilities[businessType];
}

export function hasBusinessCapability(
  businessType: BusinessType,
  capability: BusinessCapability,
): boolean {
  return businessCapabilities[
    businessType
  ].includes(capability);
}