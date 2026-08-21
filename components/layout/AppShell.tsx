"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";

const navigation = [
  {
    section: "Workspace",
    items: [{ label: "Overview", href: "/" }],
  },
  {
    section: "Sales",
    items: [
      { label: "Sales", href: "/sales" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    section: "Inventory",
    items: [{ label: "Inventory", href: "/inventory" }],
  },
  {
    section: "Purchasing",
    items: [
      { label: "Purchasing", href: "/purchasing" },
      { label: "Suppliers", href: "/suppliers" },
    ],
  },
  {
    section: "Finance",
    items: [
      { label: "Expenses", href: "/expenses" },
      { label: "Payments", href: "/payments" },
    ],
  },
  {
    section: "Insights",
    items: [{ label: "Reports", href: "/reports" }],
  },
];

interface AppShellProps {
  children: React.ReactNode;
  businessName?: string;
  businessType?: string;
}

export default function AppShell({
  children,
  businessName,
  businessType,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 text-white lg:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <Link
              href="/"
              className="group block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-sm">
                  B
                </div>

                <div>
                  <p className="text-sm font-semibold tracking-tight text-white">
                    {businessName ?? "Teketeke"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {businessType
  ? businessType.charAt(0).toUpperCase() +
    businessType.slice(1)
  : "Business operating system"}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            {navigation.map((group) => (
              <div
                key={group.section}
                className="mb-7"
              >
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {group.section}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(
                            item.href,
                          );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span
                          className={`mr-3 h-1.5 w-1.5 rounded-full transition ${
                            isActive
                              ? "bg-white"
                              : "bg-slate-700 group-hover:bg-slate-500"
                          }`}
                        />

                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/settings"
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-700" />
              Settings
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur lg:flex">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {businessName ?? "Your Business"}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Main location
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  Admin User
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
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