import type { BusinessType } from "@/types";

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
  description: string;
}

export const businessTypeOptions: BusinessTypeOption[] = [
  {
    value: "restaurant",
    label: "Restaurant",
    description:
      "Manage food, drinks, sales, inventory and purchasing.",
  },
  {
    value: "bar",
    label: "Bar",
    description:
      "Manage drinks, stock, sales, purchasing and cash.",
  },
  {
    value: "wines_spirits",
    label: "Wines & Spirits",
    description:
      "Manage wines, spirits, beer, draughts, stock, sales, purchasing and suppliers.",
  },
  {
    value: "hotel",
    label: "Hotel",
    description:
      "Manage hotel operations, sales, inventory and services.",
  },
  {
    value: "hospital",
    label: "Hospital / Clinic",
    description:
      "Manage supplies, medicines, sales, purchasing and operational activity.",
  },
  {
    value: "supermarket",
    label: "Supermarket",
    description:
      "Manage products, barcode sales, inventory, suppliers and customers.",
  },
  {
    value: "shop",
    label: "Shop",
    description:
      "Manage products, sales, inventory, purchasing and customers.",
  },
  {
    value: "boutique",
    label: "Boutique / Beauty",
    description:
      "Manage boutique products, beauty services, customers, sales and appointments.",
  },
  {
    value: "other",
    label: "Other Business",
    description:
      "Start with the core business tools and configure more later.",
  },
];