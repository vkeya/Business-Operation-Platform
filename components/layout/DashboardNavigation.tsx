"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  HandCoins,
  LayoutDashboard,
  Package,
  Sparkles,
  Monitor,
  Pill,
  ReceiptText,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  UsersRound,
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
  pharmacy: Pill,
  purchases: ShoppingBag,
  customers: Users,
  patients: UsersRound,
  appointments: CalendarDays,
  admissions: ClipboardList,
  wardsBeds: Building2,
  laboratory: FlaskConical,
  invoices: ReceiptText,
  suppliers: Building2,
  money: Wallet,
  accounting: ReceiptText,
  reports: BarChart3,
  settings: Settings,
  menu: ClipboardList,
  expenses: HandCoins,
  services: Boxes,
  pos: Monitor,
  autopilot: Sparkles,
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
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const hospitalMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hospitalOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !hospitalMenuRef.current?.contains(event.target)
      ) {
        setHospitalOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setHospitalOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hospitalOpen]);

  const hasHospitalSection = sections.some(
    (section) => section.id === "hospital" && section.items.length > 0,
  );

  return (
    <nav
      aria-label="Workspace navigation"
      className={hasHospitalSection ? "relative overflow-visible" : "overflow-x-auto"}
    >
      <div className="flex min-w-max items-center gap-1 py-3">
        {sections.flatMap((section) => {
          if (section.id === "hospital" && section.items.length > 0) {
            const isActive = section.items.some(
              (item) =>
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`),
            );

            return [
              <div
                key={section.id}
                ref={hospitalMenuRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={hospitalOpen}
                  onClick={() => setHospitalOpen((open) => !open)}
                  className={[
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                    isActive || hospitalOpen
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                      : "text-slate-500 hover:bg-violet-50 hover:text-violet-700",
                  ].join(" ")}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>Hospital</span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 transition-transform",
                      hospitalOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {hospitalOpen && (
                  <div
                    role="group"
                    aria-label="Hospital navigation"
                    className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {section.items.map((item) => {
                      const Icon = navigationIcons[item.id];
                      const itemIsActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          aria-current={itemIsActive ? "page" : undefined}
                          onClick={() => setHospitalOpen(false)}
                          className={[
                            "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                            itemIsActive
                              ? "bg-violet-600 text-white"
                              : "text-slate-500 hover:bg-violet-50 hover:text-violet-700",
                          ].join(" ")}
                        >
                          <Icon
                            className={[
                              "h-4 w-4 shrink-0",
                              itemIsActive
                                ? "text-white"
                                : "text-slate-400 group-hover:text-violet-600",
                            ].join(" ")}
                          />
                          <span className="whitespace-nowrap">
                            {translations.navigation[item.labelKey]}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>,
            ];
          }

          return section.items.map((item) => {
            const Icon = navigationIcons[item.id];
            const isActive = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
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
                  {translations.navigation[item.labelKey]}
                </span>
              </Link>
            );
          });
        })}
      </div>
    </nav>
  );
}
