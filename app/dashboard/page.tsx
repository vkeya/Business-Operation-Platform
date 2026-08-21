import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";
import { purchaseService } from "@/lib/purchase/purchaseService";
import { inventoryService } from "@/lib/inventory/inventoryService";

function isSameDay(date: Date, comparison: Date) {
  return (
    date.getFullYear() === comparison.getFullYear() &&
    date.getMonth() === comparison.getMonth() &&
    date.getDate() === comparison.getDate()
  );
}

function isSameMonth(date: Date, comparison: Date) {
  return (
    date.getFullYear() === comparison.getFullYear() &&
    date.getMonth() === comparison.getMonth()
  );
}

function formatCurrency(
  currency: string,
  value: number,
) {
  return `${currency} ${value.toFixed(2)}`;
}

const quickActions = [
  {
    title: "Record a sale",
    description: "Add a new sale and payment.",
    href: "/sales",
    icon: "S",
  },
  {
    title: "Add stock",
    description: "Receive products into your stock.",
    href: "/inventory",
    icon: "I",
  },
  {
    title: "Record a purchase",
    description: "Capture a supplier purchase.",
    href: "/purchases",
    icon: "P",
  },
  {
    title: "Add an expense",
    description: "Record money spent by the business.",
    href: "/money",
    icon: "E",
  },
];

export default async function DashboardPage() {
  const business = await getCurrentBusiness();

  const [sales, purchases, balances] =
    await Promise.all([
      saleService.list(business.id),
      purchaseService.listPurchases(business.id),
      inventoryService.listBalances(business.id),
    ]);

  const today = new Date();

  const completedSalesToday = sales.filter(
    (sale) =>
      sale.status === "COMPLETED" &&
      isSameDay(
        new Date(sale.createdAt),
        today,
      ),
  );

  const salesTodayTotal =
    completedSalesToday.reduce(
      (total, sale) =>
        total + sale.totalAmount,
      0,
    );

  const purchasesThisMonth =
    purchases.filter((purchase) =>
      isSameMonth(
        new Date(purchase.createdAt),
        today,
      ),
    );

  const purchasesThisMonthTotal =
    purchasesThisMonth.reduce(
      (total, purchase) =>
        total + purchase.totalAmount,
      0,
    );

  const totalStockQuantity =
    balances.reduce(
      (total, balance) =>
        total +
        Math.max(
          0,
          balance.quantity -
            balance.reservedQuantity,
        ),
      0,
    );

  const overviewCards = [
    {
      title: "Sales today",
      value: formatCurrency(
        business.baseCurrency,
        salesTodayTotal,
      ),
      description: `${completedSalesToday.length} completed sale${
        completedSalesToday.length === 1
          ? ""
          : "s"
      } today`,
      accent: "emerald",
    },
    {
      title: "Stock",
      value: totalStockQuantity.toFixed(2),
      description: "Available inventory quantity",
      accent: "slate",
    },
    {
      title: "Purchases",
      value: formatCurrency(
        business.baseCurrency,
        purchasesThisMonthTotal,
      ),
      description: "Purchases recorded this month",
      accent: "slate",
    },
    {
      title: "Expenses",
      value: "Not connected",
      description:
        "Expense tracking is not yet connected",
      accent: "slate",
    },
  ];

  const recentSales = sales
    .filter(
      (sale) => sale.status !== "CANCELLED",
    )
    .slice(0, 5)
    .map((sale) => ({
      id: `sale-${sale.id}`,
      type: "Sale",
      title: sale.referenceNumber,
      description: "Sales transaction",
      value: formatCurrency(
        sale.currency,
        sale.totalAmount,
      ),
      date: new Date(sale.createdAt),
    }));

  const recentPurchases = purchases
    .slice(0, 5)
    .map((purchase) => ({
      id: `purchase-${purchase.id}`,
      type: "Purchase",
      title: purchase.referenceNumber,
      description:
        purchase.supplier?.name ??
        "Supplier purchase",
      value: formatCurrency(
        purchase.currency,
        purchase.totalAmount,
      ),
      date: new Date(purchase.createdAt),
    }));

  const recentMovements =
    await inventoryService.listMovements(
      business.id,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

  const recentInventoryMovements =
    recentMovements.slice(0, 5).map(
      (movement) => ({
        id: `movement-${movement.id}`,
        type: "Inventory",
        title: movement.type.replace(
          /_/g,
          " ",
        ),
        description:
          movement.notes ??
          "Inventory movement",
        value:
          movement.quantity > 0
            ? `+${movement.quantity}`
            : movement.quantity.toString(),
        date: new Date(
          movement.createdAt,
        ),
      }),
    );

  const recentActivity = [
    ...recentSales,
    ...recentPurchases,
    ...recentInventoryMovements,
  ]
    .sort(
      (a, b) =>
        b.date.getTime() -
        a.date.getTime(),
    )
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Business overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Good morning
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Your central view of sales, stock, purchasing and
            business spending.
          </p>
        </div>

        <div className="hidden rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            Business operations
          </p>
        </div>
      </div>

      <section
        aria-label="Business overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {overviewCards.map((card) => (
          <div
            key={card.title}
            className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {card.title}
              </p>

              <span
                className={
                  card.accent === "emerald"
                    ? "h-2 w-2 rounded-full bg-emerald-500"
                    : "h-2 w-2 rounded-full bg-slate-300"
                }
              />
            </div>

            <p
              className={
                card.value === "Not connected"
                  ? "mt-5 text-lg font-semibold tracking-tight text-slate-400"
                  : "mt-5 text-3xl font-semibold tracking-tight text-slate-950"
              }
            >
              {card.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Workspace
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Get common business tasks done quickly.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                  {action.icon}
                </div>

                <span
                  className="text-slate-300 transition-colors group-hover:text-emerald-500"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-6 font-semibold text-slate-950">
                {action.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                Activity
              </p>

              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Recent activity
              </h2>
            </div>

            <span className="text-xs font-medium text-slate-400">
              Live feed
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-7 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-400 shadow-sm">
                —
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No activity yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                Your sales, purchases and stock movements will
                appear here as your business activity grows.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {activity.type}
                      </span>

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {activity.title}
                      </p>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {activity.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {activity.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Intelligence
            </p>

            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Business health
            </h2>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-600">
                +
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Business intelligence is taking shape
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your operational data is now feeding this
                  workspace. Deeper performance indicators,
                  trends and recommendations can be layered on
                  top of this foundation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-950 p-7 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
              Business operations
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Everything in one workspace.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Manage the day-to-day operations of your business from
              sales and inventory through purchasing, expenses and
              reporting.
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            View reports
            <span
              className="ml-2 text-emerald-600"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}