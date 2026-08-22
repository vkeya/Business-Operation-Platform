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
  | "menu";

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

  other: [
    ...coreBusinessCapabilities,
  ],
};

export function getBusinessCapabilities(
  businessType: BusinessType,
): BusinessCapability[] {
  return businessCapabilities[
    businessType
  ];
}

export function hasBusinessCapability(
  businessType: BusinessType,
  capability: BusinessCapability,
): boolean {
  return businessCapabilities[
    businessType
  ].includes(capability);
}