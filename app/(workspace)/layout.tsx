import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  HandCoins,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import DashboardNavigation from "@/components/layout/DashboardNavigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getBusinessNavigation } from "@/lib/navigation/businessNavigation";
import type { NavigationItem } from "@/lib/navigation/appNavigation";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { getBusinessesAction } from "@/app/businesses/actions";
import BusinessSwitcher from "@/components/business/BusinessSwitcher";
import LogoutButton from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

function getNavigationSections(
  navigation: NavigationItem[],
  t: ReturnType<typeof getTranslations>,
) {
  const sections = [
    {
      id: "workspace",
      label: t.navigation.workspace,
      items: navigation.filter(
        (item) => item.id === "dashboard",
      ),
    },
    {
      id: "restaurant",
      label: t.navigation.menu,
      items: navigation.filter(
        (item) => item.id === "menu",
      ),
    },
    {
      id: "operations",
      label: t.navigation.purchasing,
      items: navigation.filter((item) =>
        [
          "sales",
          "inventory",
          "purchases",
          "suppliers",
          "customers",
        ].includes(item.id),
      ),
    },
    {
      id: "finance",
      label: t.navigation.finance,
      items: navigation.filter((item) =>
        [
          "expenses",
          "money",
          "accounting",
        ].includes(item.id),
      ),
    },
    {
      id: "insights",
      label: t.navigation.insights,
      items: navigation.filter(
        (item) => item.id === "reports",
      ),
    },
    {
      id: "system",
      label: t.navigation.settings,
      items: navigation.filter(
        (item) => item.id === "settings",
      ),
    },
  ];

  return sections.filter(
    (section) => section.items.length > 0,
  );
}

function getBusinessInitial(name: string) {
  return (
    name.trim().charAt(0).toUpperCase() || "T"
  );
}

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const business =
    await getCurrentBusiness();

  const businesses =
    await getBusinessesAction();

  const locale =
    await getLocale();

  const translations =
    getTranslations(locale);

  const navigation =
    getBusinessNavigation(
      business.type as Parameters<
        typeof getBusinessNavigation
      >[0],
    );

  const sections =
    getNavigationSections(
      navigation,
      translations,
    );

  const businessInitial =
    getBusinessInitial(
      business.name,
    );

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-200/15 blur-3xl" />
      </div>

      <div className="relative min-h-screen">
        {/* Primary header */}
        <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex min-h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href="/dashboard"
                className="flex shrink-0 items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                  {businessInitial}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                    {business.name}
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    {
                      translations.common
                        .businessOperatingSystem
                    }
                  </p>
                </div>
              </Link>

              <div className="hidden w-64 lg:block">
                <BusinessSwitcher
                  businesses={businesses.map(
                    (item) => ({
                      id: item.id,
                      name: item.name,
                      type: item.type,
                    }),
                  )}
                  currentBusinessId={
                    business.id
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector
                currentLocale={locale}
              />

              <LogoutButton
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="relative z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <DashboardNavigation
              sections={sections}
              translations={translations}
            />
          </div>
        </div>

        {/* Workspace */}
        <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}