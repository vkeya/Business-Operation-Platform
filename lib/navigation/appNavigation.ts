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
  | "menu"
  | "expenses";

export interface NavigationItem {
  id: NavigationModule;
  labelKey: NavigationModule;
  descriptionKey: string;
  href: string;
}

export interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const appNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    labelKey: "dashboard",
    descriptionKey: "navigationDescriptions.dashboard",
    href: "/dashboard",
  },
  {
    id: "menu",
    labelKey: "menu",
    descriptionKey: "navigationDescriptions.menu",
    href: "/restaurant/menu",
  },
  {
    id: "sales",
    labelKey: "sales",
    descriptionKey: "navigationDescriptions.sales",
    href: "/sales",
  },
  {
    id: "inventory",
    labelKey: "inventory",
    descriptionKey: "navigationDescriptions.inventory",
    href: "/inventory",
  },
  {
    id: "purchases",
    labelKey: "purchases",
    descriptionKey: "navigationDescriptions.purchases",
    href: "/purchases",
  },
  {
    id: "customers",
    labelKey: "customers",
    descriptionKey: "navigationDescriptions.customers",
    href: "/customers",
  },
  {
    id: "suppliers",
    labelKey: "suppliers",
    descriptionKey: "navigationDescriptions.suppliers",
    href: "/suppliers",
  },
  {
    id: "expenses",
    labelKey: "expenses",
    descriptionKey: "navigationDescriptions.expenses",
    href: "/expenses",
  },
  {
    id: "money",
    labelKey: "money",
    descriptionKey: "navigationDescriptions.money",
    href: "/money",
  },
  {
    id: "accounting",
    labelKey: "accounting",
    descriptionKey: "navigationDescriptions.accounting",
    href: "/accounting",
  },
  {
    id: "reports",
    labelKey: "reports",
    descriptionKey: "navigationDescriptions.reports",
    href: "/reports",
  },
  {
    id: "settings",
    labelKey: "settings",
    descriptionKey: "navigationDescriptions.settings",
    href: "/settings",
  },
];