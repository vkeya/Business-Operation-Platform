import Link from "next/link";
import { appNavigation } from "@/lib/navigation/appNavigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Business Operations
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-900">
              Your Business
            </h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {appNavigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <p className="text-xs text-slate-400">
              Simple tools for running your business.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Business Operations
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your business in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Help
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                U
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}