import type { BusinessType } from "@/types";
import {
  getBusinessCapabilities,
  type BusinessCapability,
} from "@/lib/business/businessCapabilities";
import {
  appNavigation,
  type NavigationItem,
} from "./appNavigation";

const capabilityToNavigationModule:
  Record<
    BusinessCapability,
    NavigationItem["id"] | null
  > = {
  dashboard: "dashboard",
  inventory: "inventory",
  purchases: "purchases",
  sales: "sales",
  pos: "pos",
  customers: "customers",
  suppliers: "suppliers",
  payments: null,
  expenses: "expenses",
  accounting: "accounting",
  reports: "reports",
  menu: "menu",
  services: "services",
  pharmacy: "pharmacy",
  supermarket: "autopilot",
  patients: "patients",
  appointments: "appointments",
  admissions: "admissions",
  wardsBeds: "wardsBeds",
  laboratory: "laboratory",
  hospitalInvoices: "invoices",
};

export function getBusinessNavigation(
  businessType: BusinessType,
): NavigationItem[] {
  const capabilities =
    getBusinessCapabilities(
      businessType,
    );

  const navigationModules =
    new Set(
      capabilities
        .map(
          (capability) =>
            capabilityToNavigationModule[
              capability
            ],
        )
        .filter(
          (
            module,
          ): module is NavigationItem["id"] =>
            module !== null,
        ),
    );

  return appNavigation.filter(
    (item) =>
      navigationModules.has(item.id) ||
      item.id === "settings",
  );
}

