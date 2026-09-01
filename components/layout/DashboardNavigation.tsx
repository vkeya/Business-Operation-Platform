"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  HandCoins,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import type {
  NavigationItem,
  NavigationModule,
} from "@/lib/navigation/appNavigation";
import type { TranslationSet } from "@/lib/i18n/translations";

interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

interface DashboardNavigationProps {
  sections: NavigationSection[];
  translations: TranslationSet;
}

const navigationIcons: Record<
  NavigationModule,
  React.ComponentType<{
    className?: string;
  }>
> = {
  dashboard: LayoutDashboard,
  sales: ShoppingCart,
  inventory: Package,
  purchases: ShoppingBag,
  customers: Users,
  suppliers: Building2,
  money: Wallet,
  accounting: ReceiptText,
  reports: BarChart3,
  settings: Settings,
  menu: ClipboardList,
  expenses: HandCoins,
  services: Boxes,
};

function isActiveRoute(
  pathname: string,
  href: string,
) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function DashboardNavigation({
  sections,
  translations,
}: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace navigation"
      className="overflow-x-auto"
    >
      <div className="flex min-w-max items-center gap-1 py-3">
        {sections.flatMap((section) =>
          section.items.map((item) => {
            const Icon =
              navigationIcons[item.id];

            const isActive =
              isActiveRoute(
                pathname,
                item.href,
              );

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={[
                  "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-slate-500 hover:bg-violet-50 hover:text-violet-700",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-violet-600",
                  ].join(" ")}
                />

                <span className="whitespace-nowrap">
                  {
                    translations.navigation[
                      item.labelKey
                    ]
                  }
                </span>
              </Link>
            );
          }),
        )}
      </div>
    </nav>
  );
}