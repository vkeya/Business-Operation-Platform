import Link from "next/link";

const productStats = [
  {
    label: "Products",
    value: "—",
    description: "Products and services",
  },
  {
    label: "Active",
    value: "—",
    description: "Currently available",
  },
  {
    label: "Low stock",
    value: "—",
    description: "Need attention",
  },
];

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Stock / Products
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage the products and services your business sells.
          </p>
        </div>

        <Link
          href="/inventory/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add product
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {productStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Product list
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your products will appear here.
              </p>
            </div>

            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-64"
            />
          </div>
        </div>

        <div className="px-5 py-16 text-center sm:px-6">
          <div className="mx-auto max-w-md">
            <p className="text-base font-medium text-slate-900">
              No products yet
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add your first product to start tracking stock,
              purchases and sales.
            </p>

            <Link
              href="/inventory/products/new"
              className="mt-5 inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Add your first product
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}