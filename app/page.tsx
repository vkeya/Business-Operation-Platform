const modules = [
  {
    name: "Sales",
    description: "Manage sales, orders, invoices and payments.",
  },
  {
    name: "Inventory",
    description: "Track products, stock levels and movements.",
  },
  {
    name: "Purchasing",
    description: "Manage suppliers, purchases and receiving.",
  },
  {
    name: "Customers",
    description: "View customers, balances and purchase history.",
  },
  {
    name: "Suppliers",
    description: "Manage suppliers and supplier activity.",
  },
  {
    name: "Expenses",
    description: "Track business expenses and payments.",
  },
  {
    name: "Payments",
    description: "Manage cash, bank and other payment methods.",
  },
  {
    name: "Reports",
    description: "Understand sales, inventory and business performance.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Business Operations Platform
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Good morning
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Manage your sales, inventory, purchasing and finances from one
                simple workspace.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Business
              </p>
              <p className="mt-1 font-medium text-slate-900">
                Your Business
              </p>
            </div>
          </div>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Today&apos;s Sales</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              $0.00
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Orders</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Low Stock</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              $0.00
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Your workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Everything you need to run your business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <button
                key={module.name}
                type="button"
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                  {module.name.charAt(0)}
                </div>

                <h3 className="font-semibold text-slate-900">
                  {module.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {module.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}