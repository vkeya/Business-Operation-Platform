export type NavigationModule =
  | "dashboard"
  | "sales"
  | "inventory"
  | "purchases"
  | "customers"
  | "suppliers"
  | "money"
  | "accounting"
  | "reports"
  | "settings"
  | "menu";

export interface NavigationItem {
  id: NavigationModule;
  label: string;
  description: string;
  href: string;
}

export const appNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "See how your business is doing.",
    href: "/dashboard",
  },
  {
    id: "menu",
    label: "Menu",
    description: "Manage your restaurant menu.",
    href: "/restaurant/menu",
  },

  {
    id: "sales",
    label: "Sales",
    description: "Manage sales and payments.",
    href: "/sales",
  },
  {
    id: "inventory",
    label: "Stock",
    description: "Manage products and inventory.",
    href: "/inventory",
  },
  {
    id: "purchases",
    label: "Purchases",
    description: "Manage suppliers and purchases.",
    href: "/purchases",
  },
  {
    id: "customers",
    label: "Customers",
    description: "Manage your customers.",
    href: "/customers",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    description: "Manage your suppliers.",
    href: "/suppliers",
  },
  {
    id: "money",
    label: "Money",
    description: "Track payments and expenses.",
    href: "/money",
  },
  {
    id: "accounting",
    label: "Accounting",
    description: "Manage accounts and financial records.",
    href: "/accounting",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Understand your business performance.",
    href: "/reports",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Configure your business.",
    href: "/settings",
  },
];