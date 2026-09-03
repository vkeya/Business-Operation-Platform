import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Database,
  FileSpreadsheet,
  Package,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function ImportDataPage() {
  const importOptions = [
    {
      title: "Inventory",
      description:
        "Import products, stock quantities, prices, categories, and inventory balances.",
      icon: Package,
      href: "/settings/import/inventory",
      label: "01",
    },
    {
      title: "Suppliers",
      description:
        "Import supplier names, contacts, addresses, and purchasing information.",
      icon: Users,
      href: "/settings/import/suppliers",
      label: "02",
    },
    {
      title: "Customers",
      description:
        "Import customer records, contact information, and account details.",
      icon: Users,
      href: "/settings/import/customers",
      label: "03",
    },
    {
      title: "Purchases",
      description:
        "Import historical purchase records and supplier transactions.",
      icon: ShoppingCart,
      href: "/settings/import/purchases",
      label: "04",
    },
    {
      title: "Sales",
      description:
        "Import historical sales records and customer transactions.",
      icon: ShoppingBag,
      href: "/settings/import/sales",
      label: "05",
    },
    {
      title: "Expenses",
      description:
        "Import business expenses and operational cost records.",
      icon: ReceiptText,
      href: "/settings/import/expenses",
      label: "06",
    },
    {
      title: "Payments",
      description:
        "Import payment records and historical transaction information.",
      icon: WalletCards,
      href: "/settings/import/payments",
      label: "07",
    },
    {
      title: "Accounting",
      description:
        "Import accounting balances and financial information into your workspace.",
      icon: FileSpreadsheet,
      href: "/settings/import/accounting",
      label: "08",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Data Management
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                Import business data
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Import your business data
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Bring your existing business data into Teketeke from
              spreadsheets and exports from your current software.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Database className="h-6 w-6" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Choose data to import
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            What would you like to import?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Select a data type to start importing. Teketeke will
            analyze your file, suggest column mappings, validate
            your data, and let you review everything before importing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {importOptions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-slate-300">
                      {item.label}
                    </span>

                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-700" />
                  </div>
                </div>

                <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-700">
                  Start import

                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Import safely
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              Review your data before it reaches your workspace
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Teketeke will guide you through column mapping and
              validation so you can identify and correct issues
              before confirming an import.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}