import type { BusinessType } from "@/types";

export type BusinessCapability =
  | "dashboard"
  | "inventory"
  | "purchases"
  | "sales"
  | "pos"
  | "customers"
  | "suppliers"
  | "payments"
  | "expenses"
  | "accounting"
  | "reports"
  | "menu"
  | "services"
  | "pharmacy"
  | "supermarket";

export const coreBusinessCapabilities: BusinessCapability[] = [
  "dashboard",
  "inventory",
  "purchases",
  "sales",
  "pos",
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
	"supermarket",
  ],

  shop: [
    ...coreBusinessCapabilities,
  ],

  boutique: [
    ...coreBusinessCapabilities,
    "services",
  ],

  pharmacy: [
    ...coreBusinessCapabilities,
    "pharmacy",
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