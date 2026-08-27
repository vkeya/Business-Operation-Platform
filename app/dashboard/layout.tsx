import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getBusinessNavigation } from "@/lib/navigation/businessNavigation";
import type { NavigationItem } from "@/lib/navigation/appNavigation";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { getBusinessesAction } from "@/app/businesses/actions";
import BusinessSwitcher from "@/components/business/BusinessSwitcher";

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
        ["expenses", "money", "accounting"].includes(
          item.id,
        ),
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

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const business = await getCurrentBusiness();

  const businesses = await getBusinessesAction();

  const locale = await getLocale();
  const translations = getTranslations(locale);

  const navigation = getBusinessNavigation(
    business.type as Parameters<
      typeof getBusinessNavigation
    >[0],
  );

  console.log(
  "[DashboardNavigation]",
  {
    business: business.name,
    type: business.type,
    navigation: navigation.map(
      (item) => item.id,
    ),
  },
);

  const sections = getNavigationSections(
    navigation,
    translations,
  );

  const businessInitial =
    getBusinessInitial(business.name);

  const businessTypeLabel =
    business.type.charAt(0).toUpperCase() +
    business.type.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          {/* Business identity */}
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                {businessInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {business.name}
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {businessTypeLabel}
                </p>
              </div>
            </div>

			<BusinessSwitcher
  businesses={businesses.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
  }))}
  currentBusinessId={business.id}
/>

          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id}>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {section.label}
                  </p>

                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-950"
                      >
                        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-semibold text-slate-500 transition group-hover:bg-white group-hover:text-slate-900">
                          {translations.navigation[
                            item.labelKey
                          ].charAt(0)}
                        </span>

                        <span>
                          {translations.navigation[
                            item.labelKey
                          ]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Platform footer */}
          <div className="border-t border-slate-200 px-5 py-4">
            <p className="text-xs font-medium text-slate-500">
              {business.name}
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Powered by Teketeke
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {business.name}
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                {translations.common.businessOperatingSystem}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector
                currentLocale={locale}
              />

              <button
                type="button"
                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
              >
                Help
              </button>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                U
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}