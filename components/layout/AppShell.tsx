"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { translations } from "@/lib/i18n/translations";
import { getBusinessNavigation } from "@/lib/navigation/businessNavigation";
import type { NavigationItem } from "@/lib/navigation/appNavigation";
import type { BusinessType } from "@/types";

type TranslationSet = (typeof translations)["en"];

interface AppShellProps {
  children: React.ReactNode;
  businessName?: string;
  businessType?: string;
  currentLocale?: "en" | "fr" | "am";
  translations: TranslationSet;
}

function getNavigation(
  t: TranslationSet,
  businessType?: string,
) {
  const navigationItems =
    businessType
      ? getBusinessNavigation(
          businessType as BusinessType,
        )
      : [];

  const groups = [
    {
      section: t.navigation.workspace,
      items: [] as NavigationItem[],
    },
    {
      section: t.navigation.sales,
      items: [] as NavigationItem[],
    },
    {
      section: t.navigation.inventory,
      items: [] as NavigationItem[],
    },
    {
      section: t.navigation.purchasing,
      items: [] as NavigationItem[],
    },
    {
      section: t.navigation.finance,
      items: [] as NavigationItem[],
    },
    {
      section: t.navigation.insights,
      items: [] as NavigationItem[],
    },
  ];

  for (const item of navigationItems) {
    switch (item.id) {
      case "dashboard":
      case "menu":
        groups[0].items.push(item);
        break;

      case "sales":
      case "customers":
        groups[1].items.push(item);
        break;

      case "inventory":
        groups[2].items.push(item);
        break;

      case "purchases":
      case "suppliers":
        groups[3].items.push(item);
        break;

      case "expenses":
      case "money":
      case "accounting":
        groups[4].items.push(item);
        break;

	  case "services":
        groups[2].items.push(item);
        break;

      case "reports":
        groups[5].items.push(item);
        break;

      case "settings":
        break;
    }
  }

  return groups.filter(
    (group) => group.items.length > 0,
  );
}

function getNavigationLabel(
  t: TranslationSet,
  item: NavigationItem,
) {
  return t.navigation[item.labelKey];
}

export default function AppShell({
  children,
  businessName,
  businessType,
  currentLocale = "en",
  translations: t,
}: AppShellProps) {
  const pathname = usePathname();

  const navigation = getNavigation(
    t,
    businessType,
  );

  /*
 * Platform routes are independent from a business workspace.
 * They should not display the active business identity or
 * business-specific navigation.
 */
const isPlatformRoute =
  pathname === "/setup";

const isDashboardRoute =
  pathname === "/dashboard" ||
  pathname.startsWith("/dashboard/");

if (isPlatformRoute) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-sm">
              T
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Teketeke
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                {t.common.businessOperatingSystem}
              </p>
            </div>
          </Link>

          <div className="ml-auto">
            <LanguageSelector
              currentLocale={currentLocale}
            />
          </div>
        </div>
      </header>

      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}

if (isDashboardRoute) {
  return <>{children}</>;
}

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav
  translations={t}
  businessType={businessType}
/>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-72 shrink-0 flex-col bg-slate-950 text-white lg:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/dashboard" className="group block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-sm">
                  B
                </div>

                <div>
                  <p className="text-sm font-semibold tracking-tight text-white">
                    {businessName ?? "Teketeke"}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {businessType
                      ? businessType.charAt(0).toUpperCase() +
                        businessType.slice(1)
                      : t.common.businessOperatingSystem}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            {navigation.map((group) => (
              <div
                key={group.section}
                className="mb-8"
              >
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {group.section}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                            : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span
                          className={`mr-3 h-1.5 w-1.5 rounded-full ${
                            isActive
                              ? "bg-emerald-400"
                              : "bg-slate-700"
                          }`}
                        />

                        {getNavigationLabel(t, item)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-5">
            <Link
              href="/settings"
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-700" />

              {t.navigation.settings}
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:flex">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {businessName ?? t.common.yourBusiness}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t.common.businessOperatingSystem}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector
                currentLocale={currentLocale}
              />

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {t.common.adminUser}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {t.common.administrator}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                A
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}