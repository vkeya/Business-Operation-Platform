import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getDashboardMetrics } from "@/lib/dashboard/dashboardMetrics";
import { saleService } from "@/lib/sales/saleService";
import { purchaseService } from "@/lib/purchase/purchaseService";
import { inventoryService } from "@/lib/inventory/inventoryService";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthCard from "@/components/dashboard/HealthCard";
import AttentionPanel from "@/components/dashboard/AttentionPanel";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import ActivityList from "@/components/dashboard/ActivityList";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

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

function getGreeting(t: ReturnType<typeof getTranslations>) {
  const hour = new Date().getHours();

  if (hour < 12) {
    return t.dashboard.goodMorning;
  }

  if (hour < 18) {
    return t.dashboard.goodAfternoon;
  }

  return t.dashboard.goodEvening;
}

function formatActivityDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default async function DashboardPage() {
  const business = await getCurrentBusiness();
  
  const locale = await getLocale();
  const t = getTranslations(locale);

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
  
  const criticalStockBalances =
  balances.filter(
    (balance) =>
      balance.quantity <= 0,
  );

const lowStockBalanceCount =
  balances.filter(
    (balance) =>
      balance.quantity > 0 &&
      balance.quantity <= balance.reservedQuantity,
  ).length;

  const recentSales = sales
    .filter((sale) => sale.status !== "CANCELLED")
    .slice(0, 5)
    .map((sale) => ({
      id: `sale-${sale.id}`,
      type: t.dashboard.sale,
      title: sale.referenceNumber,
      description: t.dashboard.salesTransaction,
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
      type: t.dashboard.purchase,
      title: purchase.referenceNumber,
      description:
  purchase.supplier?.name ??
  t.dashboard.supplierPurchase,
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
      type: t.dashboard.inventory,
      title: movement.type.replace(/_/g, " "),
      description:
        movement.notes ??
  t.dashboard.inventoryMovement,
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
        title: t.dashboard.recordSale,
        description: t.dashboard.recordSaleDescription,
        href: "/sales/new",
        label: t.dashboard.sale,
      },
      {
        title: t.dashboard.manageMenu,
        description: t.dashboard.manageMenuDescription,
        href: "/restaurant/menu",
        label: t.dashboard.menu,
      },
      {
        title: t.dashboard.receiveStock,
        description: t.dashboard.receiveStockDescription,
        href: "/inventory/receive",
        label: t.dashboard.stock,
      },
      {
        title: t.dashboard.recordExpense,
        description: t.dashboard.recordExpenseDescription,
        href: "/expenses/new",
        label: t.dashboard.expense,
      },
    ]
  : [
      {
        title: t.dashboard.recordSale,
        description: t.dashboard.recordSaleDescription,
        href: "/sales/new",
        label: t.dashboard.sale,
      },
      {
        title: t.dashboard.receiveStock,
        description: t.dashboard.receiveStockDescription,
        href: "/inventory/receive",
        label: t.dashboard.stock,
      },
      {
        title: t.dashboard.recordPurchase,
        description: t.dashboard.recordPurchaseDescription,
        href: "/purchases/new",
        label: t.dashboard.purchase,
      },
      {
        title: t.dashboard.recordExpense,
        description: t.dashboard.recordExpenseDescription,
        href: "/expenses/new",
        label: t.dashboard.expense,
      },
    ];

  const businessTypeLabel = formatBusinessType(
    business.type,
  );

  const salesStatusLabel =
    metrics.salesCount > 0
      ? t.dashboard.tradingActivityRecorded
      : t.dashboard.noCompletedSalesToday;

  const inventoryStatusLabel =
    metrics.lowStockItems === 0
      ? t.dashboard.stockAvailable
      : t.dashboard.noAvailableStock;
	  
  const businessAlertCount =
  (metrics.lowStockItems > 0 ? 1 : 0) +
  (metrics.pendingPurchases > 0 ? 1 : 0) +
  (metrics.receivables > 0 ? 1 : 0) +
  (metrics.payables > 0 ? 1 : 0) +
  (metrics.intelligence.cash.status !== "HEALTHY"
    ? 1
    : 0);

const businessAlertPriority =
  metrics.intelligence.cash.status === "CRITICAL"
    ? t.dashboard.critical
    : businessAlertCount >= 3
      ? t.dashboard.highAttention
      : businessAlertCount > 0
        ? t.dashboard.reviewRecommended
        : t.dashboard.allClear;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Premium hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {isRestaurant
                  ? t.dashboard.restaurantWorkspace
                  : t.dashboard.businessWorkspace}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t.dashboard.live} {t.dashboard.operations}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[42px]">
              {getGreeting(t)}, {business.name}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {isRestaurant
                ? t.dashboard.restaurantAtAGlance
                : t.dashboard.businessAtAGlance}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              href="/sales/new"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {t.dashboard.recordSale}
              <span className="ml-2 text-emerald-600">
                →
              </span>
            </Link>

            <Link
              href="/inventory"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.dashboard.openInventory}
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 right-24 h-72 w-72 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* KPI row */}
      <section
        aria-label={t.dashboard.businessPerformance}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
              {t.dashboard.salesToday}
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
              ? t.dashboard.sale
              : t.dashboard.sales}{" "}
            {t.dashboard.today}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.dashboard.inventoryValue}
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
            {t.dashboard.currentStockValue}
          </p>
        </div>

       <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
      {t.dashboard.payables}
    </p>

    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        metrics.payables > 0
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {metrics.payables > 0
        ? t.dashboard.reviewStatus
        : t.dashboard.allClear}
    </span>
  </div>

  <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
    {formatCurrency(
      business.baseCurrency,
      metrics.payables,
    )}
  </p>

  <p className="mt-2 text-sm font-medium text-slate-800">
    {metrics.payables > 0
      ? t.dashboard.supplierObligationsRequireAttention
      : t.dashboard.noOutstandingSupplierObligations}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-500">
    {metrics.payables > 0
      ? t.dashboard.reviewUpcomingSupplierPayments
      : t.dashboard.recordedSupplierObligationsClear}
  </p>
</div>

        <Link
          href="/expenses"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.dashboard.expenses}
            </p>

            <span className="text-slate-300 transition group-hover:text-slate-900">
              →
            </span>
          </div>

          <p className="mt-4 text-lg font-semibold text-slate-900">
            {t.dashboard.expenses}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.dashboard.reviewAndManageBusinessSpending}
          </p>
        </Link>
      </section>


      {/* Business health expansion */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
      {t.dashboard.cashPosition}
    </p>

    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        metrics.intelligence.cash.status === "HEALTHY"
          ? "bg-emerald-50 text-emerald-700"
          : metrics.intelligence.cash.status === "WATCH"
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700"
      }`}
    >
      {metrics.intelligence.cash.status}
    </span>
  </div>

  <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
    {formatCurrency(
      business.baseCurrency,
      metrics.cashPosition,
    )}
  </p>

  <p className="mt-2 text-sm font-medium text-slate-800">
    {metrics.intelligence.cash.title}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-500">
    {metrics.intelligence.cash.message}
  </p>

  <div className="mt-4 rounded-xl bg-slate-50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
      {t.dashboard.recommendation}
    </p>

    <p className="mt-1 text-xs leading-5 text-slate-600">
      {metrics.intelligence.cash.recommendation}
    </p>
  </div>
</div>

<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
      {t.dashboard.receivables}
    </p>

    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        metrics.receivables > 0
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {metrics.receivables > 0
        ? t.dashboard.reviewStatus
        : t.dashboard.allClear}
    </span>
  </div>

  <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
    {formatCurrency(
      business.baseCurrency,
      metrics.receivables,
    )}
  </p>

  <p className="mt-2 text-sm font-medium text-slate-800">
    {metrics.receivables > 0
      ? t.dashboard.customerBalancesRequireReview
      : t.dashboard.noOutstandingReceivables}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-500">
    {metrics.receivables > 0
      ? t.dashboard.followUpOutstandingCustomerPayments
      : t.dashboard.recordedCustomerBalancesClear}
  </p>
</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
      {t.dashboard.attentionRequired}
    </p>

    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
      {t.dashboard.businessAlerts}
    </h2>
  </div>

  <span
    className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
      businessAlertPriority === t.dashboard.critical
  ? "bg-red-50 text-red-700"
  : businessAlertPriority === t.dashboard.highAttention
    ? "bg-amber-50 text-amber-700"
    : businessAlertPriority === t.dashboard.reviewRecommended
      ? "bg-sky-50 text-sky-700"
      : "bg-emerald-50 text-emerald-700"
    }`}
  >
    {businessAlertPriority}
  </span>
</div>

<p className="mt-2 text-sm text-slate-500">
  {businessAlertCount === 0
    ? t.dashboard.nothingRequiresAttention
    : `${businessAlertCount} area${
        businessAlertCount === 1 ? "" : "s"
      } ${t.dashboard.areasNeedAttention}`}
</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div
  className={`rounded-xl p-4 text-sm ${
    criticalStockBalances.length > 0
      ? "bg-red-50 text-red-700"
      : lowStockBalanceCount > 0
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700"
  }`}
>
  <p className="font-semibold">
    {criticalStockBalances.length > 0
      ? t.dashboard.stockoutRisk
      : lowStockBalanceCount > 0
        ? t.dashboard.lowStockRequiresAttention
        : t.dashboard.inventoryLevelsHealthy}
  </p>

  <p className="mt-1 text-xs leading-5">
    {criticalStockBalances.length > 0
      ? `${criticalStockBalances.length} item${criticalStockBalances.length === 1 ? "" : "s"} ${t.dashboard.noAvailableStockItems}`
      : lowStockBalanceCount > 0
        ? `${lowStockBalanceCount} item${lowStockBalanceCount === 1 ? "" : "s"} ${t.dashboard.atOrBelowReserved}`
        : t.dashboard.noImmediateInventoryShortage}
  </p>
</div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.pendingPurchases > 0
              ? `${metrics.pendingPurchases} purchase${metrics.pendingPurchases === 1 ? "" : "s"} ${t.dashboard.awaitingAction}`
              : t.dashboard.pendingPurchases}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.receivables > 0
              ? t.dashboard.customerBalancesRequireReview
              : t.dashboard.noOutstandingReceivables}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {metrics.payables > 0
              ? t.dashboard.supplierObligationsRequireReview
              : t.dashboard.noOutstandingPayables}
          </div>
		  
		            <div
            className={`rounded-xl p-4 text-sm ${
              metrics.intelligence.cash.status === "CRITICAL"
                ? "bg-red-50 text-red-700"
                : metrics.intelligence.cash.status === "WATCH"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <p className="font-semibold">
              {metrics.intelligence.cash.title}
            </p>

            <p className="mt-1 text-xs leading-5">
              {metrics.intelligence.cash.message}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t.dashboard.revenueHealth}</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{t.dashboard.active}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t.dashboard.profitHealth}</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {metrics.profit >= 0 ? t.dashboard.healthy : t.dashboard.reviewStatus}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t.dashboard.inventoryHealth}</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {metrics.lowStockItems === 0 ? t.dashboard.stable : t.dashboard.attention}
          </p>
        </div>
      </section>

      {/* Operational pulse */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.dashboard.salesStatus}
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
            {t.dashboard.inventoryStatus}
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
            {t.dashboard.purchasing}
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
                  } ${t.dashboard.purchasesInProgress}`
                : t.dashboard.noPurchasesAwaitingAction}
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            {t.dashboard.shortcuts}
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {t.dashboard.runTheBusiness}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.dashboard.commonOperationalTasks}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              href={action.href}
            />
          ))}
        </div>
      </section>

      {/* Activity and workspace */}
      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                {t.dashboard.activity}
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {t.dashboard.recentActivity}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.dashboard.latestMovement}
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {t.dashboard.live}
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-400 shadow-sm">
                —
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                {t.dashboard.activityFeedWaiting}
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {t.dashboard.activityFeedDescription}

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
                          activity.type === t.dashboard.sale
                            ? "bg-emerald-50 text-emerald-700"
                            : activity.type === t.dashboard.purchase
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
            {t.dashboard.operations}
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {isRestaurant
              ? t.dashboard.restaurantWorkspace
              : t.dashboard.businessWorkspace}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRestaurant
              ? t.dashboard.restaurantToolsReady
              : t.dashboard.businessToolsReady}
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/sales"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
            >
              <div>
                <span className="text-sm font-medium text-slate-700">
                  {t.dashboard.sale}
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {completedSales.length} {t.dashboard.completedRecords}
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
                  {t.dashboard.inventory}
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {balances.length} {t.dashboard.stockBalances}
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
                  {t.dashboard.purchasing}
                </span>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {metrics.pendingPurchases} {t.dashboard.awaitingAction}
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
                    {t.dashboard.menu}
                  </span>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {t.dashboard.manageDishesPricing}
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
              {t.dashboard.oneWorkspaceForWork}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {isRestaurant
                ? t.dashboard.restaurantConnectedDescription
                : t.dashboard.businessConnectedDescription}
            </p>
          </div>

          <Link
            href="/inventory"
            className="inline-flex w-fit shrink-0 items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            {t.dashboard.openInventory}
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