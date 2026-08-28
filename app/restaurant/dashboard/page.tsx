import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import { saleService } from "@/lib/sales/saleService";
import { recipeService } from "@/lib/restaurant/recipeService";
import {
  getCurrentBusiness,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";

export const dynamic = "force-dynamic";

export default async function RestaurantDashboardPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  const quickActions = [
    {
      title: t.restaurantDashboard.recordSale,
      description: t.restaurantDashboard.recordSaleDescription,
      href: "/sales/new",
    },
    {
      title: t.restaurantDashboard.manageMenus,
      description: t.restaurantDashboard.manageMenusDescription,
      href: "/restaurant/menu",
    },
    {
      title: t.restaurantDashboard.manageInventory,
      description: t.restaurantDashboard.manageInventoryDescription,
      href: "/inventory",
    },
    {
      title: t.restaurantDashboard.addStock,
      description: t.restaurantDashboard.addStockDescription,
      href: "/inventory",
    },
  ];

  const business =
    await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }
  
  const sales =
  await saleService.list(business.id);

const today = new Date();

const salesToday = sales.filter((sale) => {
  const saleDate = new Date(sale.createdAt);

  return (
    saleDate.getFullYear() ===
      today.getFullYear() &&
    saleDate.getMonth() ===
      today.getMonth() &&
    saleDate.getDate() ===
      today.getDate() &&
    sale.status !== "CANCELLED"
  );
});

const salesTodayTotal =
  salesToday.reduce(
    (total, sale) =>
      total + sale.totalAmount,
    0,
  );
  
  const averageSaleValue =
  salesToday.length > 0
    ? salesTodayTotal / salesToday.length
    : 0;
  
  const completedSalesToday =
  salesToday.filter(
    (sale) => sale.status === "COMPLETED",
  );
  
  const dailySalesBreakdown = new Map<
  string,
  {
    name: string;
    quantity: number;
    revenue: number;
  }
>();

for (const sale of completedSalesToday) {
  for (const item of sale.items) {
    if (!item.menuItemId) {
      continue;
    }

    const existing =
      dailySalesBreakdown.get(
        item.menuItemId,
      );

    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.totalAmount;
    } else {
      dailySalesBreakdown.set(
        item.menuItemId,
        {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.totalAmount,
        },
      );
    }
  }
}

const dailySalesItems =
  Array.from(
    dailySalesBreakdown.values(),
  ).sort(
    (a, b) =>
      b.revenue - a.revenue,
  );

const warehouses =
  await getCurrentBusinessWarehouses(
    business.id,
  );

const costingWarehouse =
  warehouses[0];
  
  const inventoryBalances =
  costingWarehouse
    ? await inventoryService.listBalances(
        business.id,
        undefined,
        costingWarehouse.id,
      )
    : [];
	
const products =
  await productService.listProducts(
    business.id,
  );

const productMap = new Map(
  products.map((product) => [
    product.id,
    product,
  ]),
);

const lowStockIngredients =
  inventoryBalances
    .filter((balance) => {
      const product =
        productMap.get(
          balance.productId,
        );

      if (!product) {
        return false;
      }

      const reorderLevel =
  product.reorderLevel ?? 0;

      return (
        reorderLevel > 0 &&
        balance.quantity <=
          reorderLevel
      );
    })
    .slice(0, 10);

const menuItems =
  await restaurantMenuService.listAvailableMenuItems(
    business.id,
  );

const menuProfitability = [];

if (costingWarehouse) {
  for (const menuItem of menuItems) {
    try {
      const recipeCost =
        await recipeService.calculateRecipeCost({
          businessId: business.id,
          menuItemId: menuItem.id,
          warehouseId: costingWarehouse.id,
        });

      const sellingPrice =
        menuItem.sellingPrice;

      const grossProfit =
        sellingPrice -
        recipeCost.totalCost;

      const grossMargin =
        sellingPrice > 0
          ? (grossProfit / sellingPrice) * 100
          : 0;

      menuProfitability.push({
        id: menuItem.id,
        name: menuItem.name,
        sellingPrice,
        foodCost: recipeCost.totalCost,
        grossProfit,
        grossMargin,
      });
    } catch {
      // Menu items without a valid recipe
      // are excluded from profitability ranking.
    }
  }
}

menuProfitability.sort(
  (a, b) =>
    b.grossProfit - a.grossProfit,
);

let foodCostToday = 0;

if (costingWarehouse) {
  for (const sale of completedSalesToday) {
    for (const item of sale.items) {
      if (!item.menuItemId) {
        continue;
      }

      try {
        const recipeCost =
          await recipeService.calculateRecipeCost({
            businessId: business.id,
            menuItemId: item.menuItemId,
            warehouseId:
              costingWarehouse.id,
          });

        foodCostToday +=
          recipeCost.totalCost *
          item.quantity;
      } catch {
        // Items without a valid recipe are
        // excluded from food-cost calculation.
      }
    }
  }
}

const grossProfitToday =
  salesTodayTotal - foodCostToday;

const grossMarginToday =
  salesTodayTotal > 0
    ? (grossProfitToday / salesTodayTotal) * 100
    : 0;
	
const topMenuItems = new Map<
  string,
  {
    name: string;
    quantity: number;
    revenue: number;
  }
>();

for (const sale of completedSalesToday) {
  for (const item of sale.items) {
    if (!item.menuItemId) {
      continue;
    }

    const existing =
      topMenuItems.get(item.menuItemId);

    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.totalAmount;
    } else {
      topMenuItems.set(item.menuItemId, {
        name: item.productName,
        quantity: item.quantity,
        revenue: item.totalAmount,
      });
    }
  }
}

const topSellingMenuItems =
  Array.from(topMenuItems.values())
    .sort(
      (a, b) =>
        b.quantity - a.quantity,
    )
    .slice(0, 5);

  return (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
    <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          {t.restaurantDashboard.restaurantOverviewBreadcrumb}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          {t.restaurantDashboard.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {t.restaurantDashboard.description}
        </p>
      </div>

      <section
        aria-label={t.restaurantDashboard.restaurantOverview}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
  title: t.restaurantDashboard.salesToday,
  value: `${business.baseCurrency} ${salesTodayTotal.toFixed(2)}`,
  description: `${salesToday.length} ${
    salesToday.length === 1
      ? t.restaurantDashboard.sale
      : t.restaurantDashboard.sales
  } ${t.restaurantDashboard.recordedToday}`,
},
          {
  title: t.restaurantDashboard.foodCost,
  value: `${business.baseCurrency} ${foodCostToday.toFixed(2)}`,
  description:
    t.restaurantDashboard.ingredientCostToday,
},
          {
  title: t.restaurantDashboard.grossProfit,
  value: `${business.baseCurrency} ${grossProfitToday.toFixed(2)}`,
  description: t.restaurantDashboard.salesLessFoodCostToday,
},
{
  title: t.restaurantDashboard.grossMargin,
  value: `${grossMarginToday.toFixed(1)}%`,
  description: t.restaurantDashboard.grossProfitPercentage,
},
        ].map((card) => (
          <div
  key={card.title}
  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {card.title}
            </p>

           <p className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </section>
	  
	  <section
  aria-label={t.restaurantDashboard.restaurantActivityMetrics}
  className="mt-4 grid gap-4 sm:grid-cols-2"
>
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
    <p className="text-sm font-medium text-slate-500">
      {t.restaurantDashboard.averageSale}
    </p>

    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
      {business.baseCurrency}{" "}
      {averageSaleValue.toFixed(2)}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      {t.restaurantDashboard.averageCompletedSaleToday}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
    <p className="text-sm font-medium text-slate-500">
      {t.restaurantDashboard.completedSales}
    </p>

    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
      {salesToday.length}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      {t.restaurantDashboard.completedSalesRecordedToday}
    </p>
  </div>
</section>

<section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
  <div className="mb-5">
    <h2 className="text-base font-semibold tracking-tight text-slate-950">
      {t.restaurantDashboard.todaysSalesBreakdown}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {t.restaurantDashboard.menuItemSalesFromCompletedTransactions}
    </p>
  </div>

  {dailySalesItems.length === 0 ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noMenuItemSalesToday}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.completedRestaurantSalesWillAppearHere}
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="pb-3 font-medium">
              {t.restaurantDashboard.menuItem}
            </th>

            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.quantity}
            </th>

            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.revenue}
            </th>
          </tr>
        </thead>

        <tbody>
          {dailySalesItems.map(
            (item) => (
              <tr
                key={item.name}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-4 font-medium text-slate-900">
                  {item.name}
                </td>

                <td className="py-4 text-right text-slate-600">
                  {item.quantity}
                </td>

                <td className="py-4 text-right font-semibold text-slate-900">
                  {business.baseCurrency}{" "}
                  {item.revenue.toFixed(2)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )}
</section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.restaurantDashboard.quickActions}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.restaurantDashboard.quickActionsDescription}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
            >
              <p className="font-semibold text-slate-950">
                {action.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {action.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-slate-500 transition-colors group-hover:text-emerald-600">
  {t.restaurantDashboard.open} <span aria-hidden="true">→</span>
</p>
            </Link>
          ))}
        </div>
      </section>

           <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">
    {t.restaurantDashboard.restaurantPerformance}
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    {t.restaurantDashboard.todaysOperatingPerformance}
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2">
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.sales}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {salesTodayTotal.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.foodCost}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {foodCostToday.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.grossProfit}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {grossProfitToday.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.grossMargin}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {grossMarginToday.toFixed(1)}%
      </p>
    </div>

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.averageSale}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {averageSaleValue.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">
        {t.restaurantDashboard.completedSales}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {salesToday.length}
      </p>
    </div>
  </div>
</section>

	  
	  <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
  <div className="mb-5">
    <h2 className="text-base font-semibold tracking-tight text-slate-950">
      {t.restaurantDashboard.topSellingMenuItems}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {t.restaurantDashboard.bestSellingRestaurantItemsToday}
    </p>
  </div>

  {topSellingMenuItems.length === 0 ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noMenuItemSalesToday}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.completedRestaurantSalesWillAppearHere}
      </p>
    </div>
  ) : (
    <div className="divide-y divide-slate-100">
      {topSellingMenuItems.map(
        (item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity} {t.restaurantDashboard.sold}
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-900">
              {business.baseCurrency}{" "}
              {item.revenue.toFixed(2)}
            </p>
          </div>
        ),
      )}
    </div>
  )}
</section>

<section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
  <div className="mb-5">
    <h2 className="text-base font-semibold tracking-tight text-slate-950">
      {t.restaurantDashboard.recentSales}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {t.restaurantDashboard.latestCompletedRestaurantSales}
    </p>
  </div>

  {completedSalesToday.length === 0 ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noCompletedSalesToday}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.completedSalesWillAppearHere}
      </p>
    </div>
  ) : (
    <div className="divide-y divide-slate-100">
      {completedSalesToday
        .slice(0, 10)
        .map((sale) => (
          <Link
            key={sale.id}
            href={`/sales/${sale.id}`}
            className="flex items-center justify-between gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {sale.referenceNumber}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {sale.items.length}{" "}
                {sale.items.length === 1
                  ? t.restaurantDashboard.item
                  : t.restaurantDashboard.items}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {business.baseCurrency}{" "}
                {sale.totalAmount.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(
                  sale.createdAt,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )}
</section>

<section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
  <div className="mb-5">
    <h2 className="text-base font-semibold tracking-tight text-slate-950">
      {t.restaurantDashboard.lowStockIngredients}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {t.restaurantDashboard.ingredientsNeedReplenishment}
    </p>
  </div>

  {!costingWarehouse ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noActiveWarehouse}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.addActiveWarehouse}
      </p>
    </div>
  ) : lowStockIngredients.length === 0 ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noLowStockIngredients}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.ingredientBalancesAboveThreshold}
      </p>
    </div>
  ) : (
    <div className="divide-y divide-slate-100">
      {lowStockIngredients.map((balance) => {
        const product =
          productMap.get(balance.productId);

        return (
          <div
            key={balance.productId}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {product?.name ??
                  `Product ${balance.productId}`}
              </p>

              {product?.sku && (
                <p className="mt-1 text-xs text-slate-500">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-slate-900">
                {balance.quantity.toString()}
                {product?.unit
                  ? ` ${product.unit}`
                  : ""}
              </p>

              <Link
                href={`/purchases/new?productId=${balance.productId}`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {t.restaurantDashboard.replenish}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

<section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
  <div className="mb-5">
    <h2 className="text-base font-semibold tracking-tight text-slate-950">
      {t.restaurantDashboard.menuProfitability}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {t.restaurantDashboard.menuItemsRankedByGrossProfit}
    </p>
  </div>

  {menuProfitability.length === 0 ? (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
      <p className="text-sm font-medium text-slate-700">
        {t.restaurantDashboard.noMenuProfitabilityData}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {t.restaurantDashboard.addRecipesForProfitability}
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="pb-3 font-medium">
              {t.restaurantDashboard.menuItem}
            </th>
            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.sellingPrice}
            </th>
            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.foodCost}
            </th>
            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.grossProfit}
            </th>
            <th className="pb-3 text-right font-medium">
              {t.restaurantDashboard.margin}
            </th>
          </tr>
        </thead>

        <tbody>
          {menuProfitability.map(
            (item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-4 font-medium text-slate-900">
                  {item.name}
                </td>

                <td className="py-4 text-right text-slate-600">
                  {business.baseCurrency}{" "}
                  {item.sellingPrice.toFixed(2)}
                </td>

                <td className="py-4 text-right text-slate-600">
                  {business.baseCurrency}{" "}
                  {item.foodCost.toFixed(2)}
                </td>

                <td className="py-4 text-right font-semibold text-slate-900">
                  {business.baseCurrency}{" "}
                  {item.grossProfit.toFixed(2)}
                </td>

                <td className="py-4 text-right font-semibold text-slate-900">
                  {item.grossMargin.toFixed(1)}%
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )}
</section>
    </div>
  );
}