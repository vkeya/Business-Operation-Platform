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
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <Link href="/" className="block">
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                Business Operations
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Business management made simple
              </p>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navigation.map((group) => (
              <div key={group.section} className="mb-6">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.section}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <Link
              href="/settings"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Settings
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:flex">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Your Business
              </p>

              <p className="text-xs text-slate-500">Main location</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  Admin User
                </p>

                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                A
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}