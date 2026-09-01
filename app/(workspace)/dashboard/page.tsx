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
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
  Users,
} from "lucide-react";

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
  <div className="space-y-6">
    {/* Premium workspace hero */}
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-slate-950 to-slate-950" />

      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
              <Sparkles className="h-3 w-3" />

              {isRestaurant
                ? t.dashboard.restaurantWorkspace
                : t.dashboard.businessWorkspace}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              {t.dashboard.live} {t.dashboard.operations}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {getGreeting(t)}, {business.name}.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {isRestaurant
              ? t.dashboard.restaurantAtAGlance
              : t.dashboard.businessAtAGlance}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-300" />

              {salesStatusLabel}
            </span>

            <span className="inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-300" />

              {inventoryStatusLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/sales/new"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            <ShoppingCart className="h-4 w-4" />

            {t.dashboard.recordSale}

            <ArrowRight className="h-4 w-4 text-violet-600 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/inventory"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <Package className="h-4 w-4 text-violet-300" />

            {t.dashboard.openInventory}
          </Link>
        </div>
      </div>
    </section>

    {/* Dashboard summary */}
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
            {t.dashboard.businessPerformance}
          </p>

          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            Your business at a glance
          </h2>
        </div>

        <span className="hidden items-center gap-2 text-xs text-slate-400 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live workspace data
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Sales */}
        <div className="group relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/50">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-100/40 blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <TrendingUp className="h-5 w-5" />
              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.salesToday}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(
                business.baseCurrency,
                metrics.revenue,
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {metrics.salesCount} completed{" "}
              {metrics.salesCount === 1
                ? t.dashboard.sale
                : t.dashboard.sales}{" "}
              {t.dashboard.today}
            </p>
          </div>
        </div>

        {/* Inventory */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sky-100/40 blur-2xl" />

          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Boxes className="h-5 w-5" />
            </div>

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.inventoryValue}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(
                business.baseCurrency,
                metrics.inventoryValue,
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {t.dashboard.currentStockValue}
            </p>
          </div>
        </div>

        {/* Payables */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <CreditCard className="h-5 w-5" />
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
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

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.payables}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(
                business.baseCurrency,
                metrics.payables,
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {metrics.payables > 0
                ? t.dashboard.supplierObligationsRequireAttention
                : t.dashboard.noOutstandingSupplierObligations}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <Link
          href="/expenses"
          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
        >
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-100/40 blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Wallet className="h-5 w-5" />
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
            </div>

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.expenses}
            </p>

            <p className="mt-2 text-lg font-bold text-slate-950">
              {t.dashboard.expenses}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {t.dashboard.reviewAndManageBusinessSpending}
            </p>
          </div>
        </Link>
      </div>
    </section>

    {/* Business health */}
    <section className="grid gap-4 lg:grid-cols-2">
      {/* Cash position */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Banknote className="h-5 w-5" />
            </div>

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.cashPosition}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(
                business.baseCurrency,
                metrics.cashPosition,
              )}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
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

        <p className="mt-5 text-sm font-bold text-slate-800">
          {metrics.intelligence.cash.title}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {metrics.intelligence.cash.message}
        </p>

        <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
            {t.dashboard.recommendation}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {metrics.intelligence.cash.recommendation}
          </p>
        </div>
      </div>

      {/* Receivables */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>

            <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.dashboard.receivables}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(
                business.baseCurrency,
                metrics.receivables,
              )}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
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

        <p className="mt-5 text-sm font-bold text-slate-800">
          {metrics.receivables > 0
            ? t.dashboard.customerBalancesRequireReview
            : t.dashboard.noOutstandingReceivables}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {metrics.receivables > 0
            ? t.dashboard.followUpOutstandingCustomerPayments
            : t.dashboard.recordedCustomerBalancesClear}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Customer payment visibility is tracked
            directly from your business activity.
          </p>
        </div>
      </div>
    </section>

    {/* Attention */}
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                {t.dashboard.attentionRequired}
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {t.dashboard.businessAlerts}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {businessAlertCount === 0
              ? t.dashboard.nothingRequiresAttention
              : `${businessAlertCount} area${
                  businessAlertCount === 1
                    ? ""
                    : "s"
                } ${t.dashboard.areasNeedAttention}`}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
            businessAlertPriority === t.dashboard.critical
              ? "bg-red-50 text-red-700"
              : businessAlertPriority ===
                    t.dashboard.highAttention
                ? "bg-amber-50 text-amber-700"
                : businessAlertPriority ===
                      t.dashboard.reviewRecommended
                  ? "bg-sky-50 text-sky-700"
                  : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {businessAlertPriority}
        </span>
      </div>

      <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-slate-400" />

            <p className="text-sm font-bold text-slate-800">
              {criticalStockBalances.length > 0
                ? t.dashboard.stockoutRisk
                : lowStockBalanceCount > 0
                  ? t.dashboard.lowStockRequiresAttention
                  : t.dashboard.inventoryLevelsHealthy}
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {criticalStockBalances.length > 0
              ? `${criticalStockBalances.length} item${
                  criticalStockBalances.length === 1
                    ? ""
                    : "s"
                } ${t.dashboard.noAvailableStockItems}`
              : lowStockBalanceCount > 0
                ? `${lowStockBalanceCount} item${
                    lowStockBalanceCount === 1
                      ? ""
                      : "s"
                  } ${t.dashboard.atOrBelowReserved}`
                : t.dashboard.noImmediateInventoryShortage}
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-4 w-4 text-slate-400" />

            <p className="text-sm font-bold text-slate-800">
              {t.dashboard.purchasing}
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {metrics.pendingPurchases > 0
              ? `${metrics.pendingPurchases} purchase${
                  metrics.pendingPurchases === 1
                    ? ""
                    : "s"
                } ${t.dashboard.awaitingAction}`
              : t.dashboard.pendingPurchases}
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-slate-400" />

            <p className="text-sm font-bold text-slate-800">
              {t.dashboard.receivables}
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {metrics.receivables > 0
              ? t.dashboard.customerBalancesRequireReview
              : t.dashboard.noOutstandingReceivables}
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-slate-400" />

            <p className="text-sm font-bold text-slate-800">
              {metrics.intelligence.cash.title}
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {metrics.intelligence.cash.message}
          </p>
        </div>
      </div>
    </section>

    {/* Quick actions */}
    <section>
      <div className="mb-5">
        <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
          {t.dashboard.shortcuts}
        </p>

        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
          {t.dashboard.runTheBusiness}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {t.dashboard.commonOperationalTasks}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-900">
              {action.title}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>

    {/* Activity and workspace */}
    <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
      {/* Activity */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                  {t.dashboard.activity}
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  {t.dashboard.recentActivity}
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {t.dashboard.latestMovement}
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            {t.dashboard.live}
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-800">
              {t.dashboard.activityFeedWaiting}
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {t.dashboard.activityFeedDescription}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between gap-4 p-4 transition hover:bg-violet-50/40 ${
                  index > 0
                    ? "border-t border-slate-100"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      activity.type === t.dashboard.sale
                        ? "bg-emerald-50 text-emerald-600"
                        : activity.type ===
                            t.dashboard.purchase
                          ? "bg-amber-50 text-amber-600"
                          : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    {activity.type === t.dashboard.sale ? (
                      <ShoppingCart className="h-4 w-4" />
                    ) : activity.type ===
                      t.dashboard.purchase ? (
                      <ShoppingBag className="h-4 w-4" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {activity.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">
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

      {/* Workspace */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-300">
            <BarChart3 className="h-5 w-5" />
          </div>

          <p className="eyebrow mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
            {t.dashboard.operations}
          </p>

          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
            {isRestaurant
              ? t.dashboard.restaurantWorkspace
              : t.dashboard.businessWorkspace}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isRestaurant
              ? t.dashboard.restaurantToolsReady
              : t.dashboard.businessToolsReady}
          </p>

          <div className="mt-6 space-y-2">
            <Link
              href="/sales"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold">
                  {t.dashboard.sale}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {completedSales.length}{" "}
                  {t.dashboard.completedRecords}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
            </Link>

            <Link
              href="/inventory"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold">
                  {t.dashboard.inventory}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {balances.length}{" "}
                  {t.dashboard.stockBalances}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
            </Link>

            <Link
              href="/purchases"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold">
                  {t.dashboard.purchasing}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {metrics.pendingPurchases}{" "}
                  {t.dashboard.awaitingAction}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
            </Link>

            {isRestaurant && (
              <Link
                href="/restaurant/menu"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {t.dashboard.menu}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {t.dashboard.manageDishesPricing}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* Teketeke intelligence */}
    <section className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-7 sm:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />

            <p className="eyebrow text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Teketeke Intelligence
            </p>
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            {t.dashboard.oneWorkspaceForWork}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isRestaurant
              ? t.dashboard.restaurantConnectedDescription
              : t.dashboard.businessConnectedDescription}
          </p>
        </div>

        <Link
          href="/inventory"
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          {t.dashboard.openInventory}

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  </div>
);
}