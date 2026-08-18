const overviewCards = [
  {
    title: "Sales",
    value: "—",
    description: "Sales recorded today",
  },
  {
    title: "Stock",
    value: "—",
    description: "Items currently in stock",
  },
  {
    title: "Purchases",
    value: "—",
    description: "Purchases this period",
  },
  {
    title: "Expenses",
    value: "—",
    description: "Expenses this period",
  },
];

const quickActions = [
  {
    title: "Record a sale",
    description: "Add a new sale and payment.",
    href: "/sales",
  },
  {
    title: "Add stock",
    description: "Receive products into your stock.",
    href: "/inventory",
  },
  {
    title: "Record a purchase",
    description: "Capture a supplier purchase.",
    href: "/purchases",
  },
  {
    title: "Add an expense",
    description: "Record money spent by the business.",
    href: "/money",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Overview
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Good morning
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Here&apos;s your business at a glance. As you start using the
          platform, this space will become your live business overview.
        </p>
      </div>

      <section
        aria-label="Business overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {overviewCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Get common tasks done quickly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
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
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Recent activity
          </h3>

          <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-700">
              No activity yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your sales, purchases, stock movements and payments will
              appear here.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Business health
          </h3>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              Your dashboard is getting ready
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Once you start recording sales, purchases, stock and
              expenses, we&apos;ll turn this area into a useful picture
              of how your business is performing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}