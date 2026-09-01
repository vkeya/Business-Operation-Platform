import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
const business = await getCurrentBusiness();

const locale = await getLocale();
const t = getTranslations(locale);

const stockActions = [
{
title: t.inventory.addProduct,
description: t.inventory.createProductOrService,
href: "/inventory/products/new",
label: t.inventory.catalogue,
},
{
title: t.inventory.receiveStock,
description: t.inventory.receiveStockDescription,
href: "/inventory/receive",
label: t.inventory.inbound,
},
{
title: t.inventory.adjustStock,
description: t.inventory.adjustStockDescription,
href: "/inventory/adjust",
label: t.inventory.correction,
},
{
title: t.inventory.transferStock,
description: t.inventory.transferStockDescription,
href: "/inventory/transfer",
label: t.inventory.movement,
},
];

const balances = await inventoryService.listBalances(
business.id,
);

const products = await productService.listProducts(
business.id,
);

const warehouses = await prisma.warehouse.findMany({
where: {
businessId: business.id,
isActive: true,
},
orderBy: {
name: "asc",
},
});

const stockRows = balances
.map((balance) => {
const product = products.find(
(item) => item.id === balance.productId,
);


  const warehouse = warehouses.find(
    (item) => item.id === balance.warehouseId,
  );

  if (!product || !warehouse) {
    return null;
  }

  return {
    id: balance.id,
    productName: product.name,
    sku: product.sku,
    warehouseName: warehouse.name,
    warehouseCode: warehouse.code,
    quantity: balance.quantity,
    averageCost: balance.averageCost,
    currency: balance.currency,
  };
})
.filter(
  (row): row is NonNullable<typeof row> =>
    row !== null,
);


const inventoryProducts = products.filter(
(product) =>
product.type === "PRODUCT" &&
product.trackInventory,
);

const totalUnitsInStock = balances.reduce(
(total, balance) => total + balance.quantity,
0,
);

const lowStockCount = inventoryProducts.filter(
(product) => {
if (
product.minimumStock === null &&
product.reorderLevel === null
) {
return false;
}


  const productQuantity = balances
    .filter(
      (balance) =>
        balance.productId === product.id,
    )
    .reduce(
      (total, balance) =>
        total + balance.quantity,
      0,
    );

  const threshold =
    product.reorderLevel ??
    product.minimumStock ??
    0;

  return productQuantity <= threshold;
},


).length;

const stockAlerts = inventoryProducts
.map((product) => {
const quantity = balances
.filter(
(balance) =>
balance.productId === product.id,
)
.reduce(
(total, balance) =>
total + balance.quantity,
0,
);


  const threshold =
    product.reorderLevel ??
    product.minimumStock;

  if (
    threshold === null ||
    threshold === undefined
  ) {
    return null;
  }

  if (quantity <= 0) {
    return {
      product,
      quantity,
      threshold,
      status: "OUT_OF_STOCK" as const,
    };
  }

  if (quantity <= threshold) {
    return {
      product,
      quantity,
      threshold,
      status: "LOW_STOCK" as const,
    };
  }

  return null;
})
.filter(
  (
    alert,
  ): alert is NonNullable<typeof alert> =>
    alert !== null,
);


const stockValueByCurrency =
balances.reduce<Record<string, number>>(
(totals, balance) => {
const value =
balance.quantity *
balance.averageCost;


    totals[balance.currency] =
      (totals[balance.currency] ?? 0) +
      value;

    return totals;
  },
  {},
);


const stockValueEntries = Object.entries(
stockValueByCurrency,
);

return ( <div className="space-y-6">
{/* Inventory hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.inventory.title}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
              lowStockCount > 0
                ? "bg-amber-400/10 text-amber-300"
                : "bg-emerald-400/10 text-emerald-300"
            }`}
          >
            {lowStockCount > 0
              ? t.inventory.itemsNeedAttention.replace(
                  "{count}",
                  String(lowStockCount),
                )
              : t.inventory.stockLevelsHealthy}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.inventory.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {t.inventory.heroDescription}
        </p>
      </div>

      <Link
        href="/inventory/products/new"
        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
      >
        <span className="text-violet-600">
          +
        </span>

        {t.inventory.addProduct}
      </Link>
    </div>
  </section>

  {/* Inventory overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.inventory.operations}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.inventory.title}
      </h2>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.inventory.products}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-violet-900">
              {inventoryProducts.length}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
            ▦
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.inventory.itemsActivelyTracked}
        </p>
      </article>

      <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.inventory.unitsInStock}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-emerald-900">
              {totalUnitsInStock.toLocaleString()}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-emerald-700">
            ↕
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.inventory.acrossActiveStockBalances}
        </p>
      </article>

      <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.inventory.lowStock}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-amber-900">
              {lowStockCount}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-700">
            !
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.inventory.belowConfiguredThreshold}
        </p>
      </article>

      <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.inventory.stockValue}
            </p>

            <div className="mt-4 space-y-1">
              {stockValueEntries.length === 0 ? (
                <p className="text-2xl font-semibold tracking-tight text-blue-900">
                  —
                </p>
              ) : (
                stockValueEntries.map(
                  ([currency, value]) => (
                    <p
                      key={currency}
                      className="text-xl font-semibold tracking-tight text-blue-900"
                    >
                      {currency}{" "}
                      {value.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  ),
                )
              )}
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-700">
            $
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.inventory.basedOnAverageStockCost}
        </p>
      </article>
    </div>
  </section>

  {/* Quick actions */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.inventory.operations}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.inventory.quickActions}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {t.inventory.commonTasks}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stockActions.map((action, index) => (
        <Link
          key={action.title}
          href={action.href}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-slate-600 transition group-hover:bg-slate-950 group-hover:text-white">
              {String(index + 1).padStart(
                2,
                "0",
              )}
            </span>

            <span className="text-slate-300 transition group-hover:text-slate-700">
              →
            </span>
          </div>

          <p className="mt-5 font-semibold text-slate-900">
            {action.title}
          </p>

          <p className="mt-2 text-sm leading-5 text-slate-500">
            {action.description}
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {action.label}
          </p>
        </Link>
      ))}
    </div>
  </section>

  {/* Inventory workspace */}
  <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.inventory.liveStock}
          </p>

          <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
            {t.inventory.currentStockLevels}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.inventory.latestStockBalances}
          </p>
        </div>

        <Link
          href="/inventory/history"
          className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          {t.inventory.viewHistory} →
        </Link>
      </div>

      {stockRows.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
            —
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            {t.inventory.noStockRecordsYet}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {t.inventory.receiveFirstStock}
          </p>

          <Link
            href="/inventory/receive"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.inventory.receiveStock}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {stockRows.slice(0, 6).map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/70"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold uppercase text-slate-500">
                  {row.productName
                    .trim()
                    .charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {row.productName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {row.sku} ·{" "}
                    {row.warehouseName}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {row.quantity.toLocaleString()}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {row.warehouseCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.inventory.attention}
        </p>

        <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
          {t.inventory.stockAlerts}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.inventory.itemsNeedReplenishment}
        </p>
      </div>

      <div className="p-4">
        {stockAlerts.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              ✓
            </div>

            <p className="mt-4 text-sm font-semibold text-emerald-900">
              {t.inventory.stockLevelsLookHealthy}
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              {t.inventory.noProductsBelowThreshold}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stockAlerts
              .slice(0, 6)
              .map((alert) => (
                <Link
                  key={alert.product.id}
                  href={`/inventory/products/${alert.product.id}`}
                  className="block rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {alert.product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {alert.product.sku}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        alert.status ===
                        "OUT_OF_STOCK"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {alert.status ===
                      "OUT_OF_STOCK"
                        ? t.inventory.outOfStock
                        : t.inventory.lowStock}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">
                        {alert.quantity}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {t.inventory.currentQuantity}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {t.inventory.threshold}{" "}
                      <span className="font-semibold text-slate-700">
                        {alert.threshold}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      {stockAlerts.length > 6 && (
        <div className="border-t border-slate-100 px-6 py-4">
          <Link
            href="/inventory/products"
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            {t.inventory.viewAllProducts} →
          </Link>
        </div>
      )}
    </div>
  </section>

  {/* Management links */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.inventory.operations}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.inventory.catalogue}
      </h2>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <Link
        href="/inventory/products"
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.inventory.catalogue}
        </p>

        <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          {t.inventory.manageProducts}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {products.length}{" "}
          {t.inventory.productsAndServices}
        </p>

        <p className="mt-4 text-xs font-semibold text-slate-500 group-hover:text-slate-900">
          {t.inventory.openCatalogue} →
        </p>
      </Link>

      <Link
        href="/inventory/history"
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.inventory.activity}
        </p>

        <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          {t.inventory.stockMovements}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {t.inventory.reviewStockMovements}
        </p>

        <p className="mt-4 text-xs font-semibold text-slate-500 group-hover:text-slate-900">
          {t.inventory.viewMovements} →
        </p>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.inventory.warehouses}
        </p>

        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          {warehouses.length}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {t.inventory.activeInventoryLocations}
        </p>
      </div>
    </div>
  </section>
</div>


);
}
