const stockActions = [
  {
    title: "Add product",
    description: "Create a product or service.",
  },
  {
    title: "Receive stock",
    description: "Record products coming into your business.",
  },
  {
    title: "Adjust stock",
    description: "Correct a stock quantity when needed.",
  },
];

const stockSections = [
  {
    title: "Products",
    description: "Manage the products and services you sell.",
  },
  {
    title: "Stock levels",
    description: "See what you currently have available.",
  },
  {
    title: "Stock movements",
    description: "See what came in, went out or changed.",
  },
];

export default function InventoryPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Stock
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Manage your stock
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Keep track of what you have, what is moving and what needs
          attention.
        </p>
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common stock tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stockActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm"
            >
              <p className="font-medium text-slate-900">
                {action.title}
              </p>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                {action.description}
              </p>

              <p className="mt-4 text-sm font-medium text-slate-700">
                Open →
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Stock management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Everything you need to manage your products and stock.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stockSections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h3 className="font-semibold text-slate-900">
                {section.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {section.description}
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  No records yet
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Stock overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your live stock levels will appear here.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Getting started
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Products
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              —
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Units in stock
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              —
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Low stock
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              —
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}