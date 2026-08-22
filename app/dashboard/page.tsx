import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getDashboardMetrics } from "@/lib/dashboard/dashboardMetrics";
import { saleService } from "@/lib/sales/saleService";
import { purchaseService } from "@/lib/purchase/purchaseService";
import { inventoryService } from "@/lib/inventory/inventoryService";

export const dynamic = "force-dynamic";

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

function formatCurrency(currency: string, value: number) {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatBusinessType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatActivityDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default async function DashboardPage() {
  const business = await getCurrentBusiness();

  const metrics =
    await getDashboardMetrics(
      business.id,
    );

  const [
    sales,
    purchases,
    balances,
    recentMovements,
  ] = await Promise.all([
    saleService.list(
      business.id,
    ),

    purchaseService.listPurchases(
      business.id,
    ),

    inventoryService.listBalances(
      business.id,
    ),

    inventoryService.listMovements(
      business.id,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ),
  ]);



  const today = new Date();
  const isRestaurant = business.type === "restaurant";

  const completedSalesToday = sales.filter(
    (sale) =>
      sale.status === "COMPLETED" &&
      isSameDay(new Date(sale.createdAt), today),
  );

  const salesTodayTotal = metrics.revenue;

  const purchasesThisMonth = purchases.filter((purchase) =>
    isSameMonth(new Date(purchase.createdAt), today),
  );

  const purchasesThisMonthTotal = metrics.payables;

  const totalStockQuantity = metrics.inventoryValue;

  const completedSales = sales.filter(
    (sale) => sale.status === "COMPLETED",
  );

  const pendingPurchases = purchases.filter(
    (purchase) =>
      purchase.status === "DRAFT" ||
      purchase.status === "ORDERED",
  );

  const cancelledSales = sales.filter(
    (sale) => sale.status === "CANCELLED",
  );

  const availableStockBalances = balances.filter(
    (balance) => balance.quantity > balance.reservedQuantity,
  );

  const stockBalanceCount = balances.length;

  const recentSales = sales
    .filter((sale) => sale.status !== "CANCELLED")
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
        purchase.supplier?.name ?? "Supplier purchase",
      value: formatCurrency(
        purchase.currency,
        purchase.totalAmount,
      ),
      date: new Date(purchase.createdAt),
    }));

  const recentInventoryMovements = recentMovements
    .slice(0, 5)
    .map((movement) => ({
      id: `movement-${movement.id}`,
      type: "Inventory",
      title: movement.type.replace(/_/g, " "),
      description:
        movement.notes ?? "Inventory movement",
      value:
        movement.quantity > 0
          ? `+${movement.quantity}`
          : movement.quantity.toString(),
      date: new Date(movement.createdAt),
    }));

  const recentActivity = [
    ...recentSales,
    ...recentPurchases,
    ...recentInventoryMovements,
  ]
    .sort(
      (a, b) =>
        b.date.getTime() - a.date.getTime(),
    )
    .slice(0, 6);

  const quickActions = isRestaurant
    ? [
        {
          title: "Record a sale",
          description:
            "Capture today's customer orders and payments.",
          href: "/sales/new",
          label: "Sale",
        },
        {
          title: "Manage menu",
          description:
            "Update dishes, drinks and menu pricing.",
          href: "/restaurant/menu",
          label: "Menu",
        },
        {
          title: "Receive stock",
          description:
            "Bring ingredients and products into inventory.",
          href: "/inventory/receive",
          label: "Stock",
        },
        {
          title: "Record expense",
          description:
            "Capture money spent running the restaurant.",
          href: "/expenses/new",
          label: "Expense",
        },
      ]
    : [
        {
          title: "Record a sale",
          description:
            "Capture a new sale and payment.",
          href: "/sales/new",
          label: "Sale",
        },
        {
          title: "Add stock",
          description:
            "Receive products into your inventory.",
          href: "/inventory/receive",
          label: "Stock",
        },
        {
          title: "Record a purchase",
          description:
            "Capture a supplier purchase.",
          href: "/purchases/new",
          label: "Purchase",
        },
        {
          title: "Record expense",
          description:
            "Record money spent by the business.",
          href: "/expenses/new",
          label: "Expense",
        },
      ];

  const businessTypeLabel = formatBusinessType(
    business.type,
  );

  const salesStatusLabel =
    metrics.salesCount > 0
      ? "Trading activity recorded"
      : "No completed sales today";

  const inventoryStatusLabel =
    metrics.lowStockItems === 0
      ? "Stock available"
      : "No available stock";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Premium hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {businessTypeLabel} workspace
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live operations
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[42px]">
              {getGreeting()}, {business.name}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {isRestaurant
                ? "Your restaurant at a glance. Monitor today's trading activity, stock and purchasing from one workspace."
                : "Your business at a glance. Monitor daily activity, stock and purchasing from one workspace."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              href="/sales/new"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Record a sale
              <span className="ml-2 text-emerald-600">
                →
              </span>
            </Link>

            <Link
              href="/inventory"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open inventory
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 right-24 h-72 w-72 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* KPI row */}
      <section
        aria-label="Business performance"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
              Sales today
            </p>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-emerald-950">
            {formatCurrency(
              business.baseCurrency,
              metrics.revenue,
            )}
          </p>

          <p className="mt-2 text-xs text-emerald-700">
            {metrics.salesCount} completed{" "}
            {metrics.salesCount === 1
              ? "sale"
              : "sales"}{" "}
            today
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Inventory Value
            </p>

            <span className="text-slate-300">◈</span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              business.baseCurrency,
              metrics.inventoryValue,
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Current stock value
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Payables
            </p>

            <span className="text-slate-300">↗</span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              business.baseCurrency,
              metrics.payables,
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Outstanding supplier obligations
          </p>
        </div>

        <Link
          href="/expenses"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Expenses
            </p>

            <span className="text-slate-300 transition group-hover:text-slate-900">
              →
            </span>
          </div>

          <p className="mt-4 text-lg font-semibold text-slate-900">
            Review expenses
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Review and manage business spending
          </p>
        </Link>
      </section>


      {/* Business health expansion */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Cash Position
          </p>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              business.baseCurrency,
              metrics.cashPosition,
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Available business cash position
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Receivables
          </p>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              business.baseCurrency,
              metrics.receivables,
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Customer balances outstanding
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            Attention Required
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Business alerts
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.lowStockItems > 0
              ? `${metrics.lowStockItems} low stock item${metrics.lowStockItems === 1 ? "" : "s"} require attention`
              : "No low stock issues"}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.pendingPurchases > 0
              ? `${metrics.pendingPurchases} purchase${metrics.pendingPurchases === 1 ? "" : "s"} awaiting action`
              : "No pending purchases"}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.receivables > 0
              ? "Customer balances require review"
              : "No outstanding receivables"}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.payables > 0
              ? "Supplier obligations require review"
              : "No outstanding payables"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Revenue Health</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">Active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Profit Health</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {metrics.profit >= 0 ? "Healthy" : "Review"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Inventory Health</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {metrics.lowStockItems === 0 ? "Stable" : "Attention"}
          </p>
        </div>
      </section>

      {/* Operational pulse */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Sales status
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                metrics.salesCount > 0
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />

            <p className="text-sm font-semibold text-slate-800">
              {salesStatusLabel}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Inventory status
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                metrics.lowStockItems === 0
                  ? "bg-emerald-500"
                  : "bg-amber-400"
              }`}
            />

            <p className="text-sm font-semibold text-slate-800">
              {inventoryStatusLabel}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Purchasing
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                metrics.pendingPurchases > 0
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
            />

            <p className="text-sm font-semibold text-slate-800">
              {metrics.pendingPurchases > 0
                ? `${metrics.pendingPurchases} purchase${
                    metrics.pendingPurchases === 1
                      ? ""
                      : "s"
                  } in progress`
                : "No purchases awaiting action"}
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Shortcuts
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Run the business
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Get the most common operational tasks done quickly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-[9px] font-bold uppercase tracking-wide text-white">
                  {action.label.slice(0, 2)}
                </div>

                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Activity and workspace */}
      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                Activity
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Recent activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The latest movement across your operation.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Live
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-400 shadow-sm">
                —
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                Your activity feed is waiting
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                Sales, purchases and inventory movements will
                appear here as you operate the business.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          activity.type === "Sale"
                            ? "bg-emerald-50 text-emerald-700"
                            : activity.type === "Purchase"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
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
                      {formatActivityDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Operations
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {isRestaurant
              ? "Restaurant workspace"
              : "Business workspace"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRestaurant
              ? "Your core restaurant tools are connected and ready for daily operations."
              : "Your core business tools are connected and ready for daily operations."}
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/sales"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
            >
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Sales
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {completedSales.length} completed records
                </p>
              </div>

              <span className="text-slate-400">
                →
              </span>
            </Link>

            <Link
              href="/inventory"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
            >
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Inventory
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {balances.length} stock balances
                </p>
              </div>

              <span className="text-slate-400">
                →
              </span>
            </Link>

            <Link
              href="/purchases"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
            >
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Purchasing
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {metrics.pendingPurchases} awaiting action
                </p>
              </div>

              <span className="text-slate-400">
                →
              </span>
            </Link>

            {isRestaurant && (
              <Link
                href="/restaurant/menu"
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Menu
                  </span>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Manage dishes and pricing
                  </p>
                </div>

                <span className="text-slate-400">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Platform / business value */}
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              Teketeke
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              One workspace for the work that matters.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {isRestaurant
                ? "Sales, menu, inventory and purchasing are connected in one place so you can spend less time managing systems and more time running your restaurant."
                : "Sales, inventory, purchasing and expenses are connected in one place so you can spend less time managing systems and more time running your business."}
            </p>
          </div>

          <Link
            href="/inventory"
            className="inline-flex w-fit shrink-0 items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Open inventory
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