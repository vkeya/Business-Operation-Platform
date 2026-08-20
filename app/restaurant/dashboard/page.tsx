import Link from "next/link";
import { notFound } from "next/navigation";
import { saleService } from "@/lib/sales/saleService";
import { recipeService } from "@/lib/restaurant/recipeService";
import {
  getCurrentBusiness,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";

const quickActions = [
  {
    title: "Record a sale",
    description: "Record a restaurant sale.",
    href: "/sales/new",
  },
  {
    title: "Manage menus",
    description: "Manage dishes, drinks and menu items.",
    href: "/restaurant/menu",
  },
  {
    title: "Manage inventory",
    description: "View stock and inventory movements.",
    href: "/inventory",
  },
  {
    title: "Add stock",
    description: "Receive ingredients into inventory.",
    href: "/inventory",
  },
];

export default async function RestaurantDashboardPage() {
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
        product.reorderLevel?.toNumber
          ? product.reorderLevel.toNumber()
          : Number(
              product.reorderLevel ?? 0,
            );

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
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Restaurant / Overview
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Restaurant dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Monitor your restaurant operations, menus,
          inventory and sales from one place.
        </p>
      </div>

      <section
        aria-label="Restaurant overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
  title: "Sales today",
  value: `${business.baseCurrency} ${salesTodayTotal.toFixed(2)}`,
  description: `${salesToday.length} sale${
    salesToday.length === 1 ? "" : "s"
  } recorded today`,
},
          {
  title: "Food cost",
  value: `${business.baseCurrency} ${foodCostToday.toFixed(2)}`,
  description:
    "Ingredient cost for completed sales today",
},
          {
  title: "Gross profit",
  value: `${business.baseCurrency} ${grossProfitToday.toFixed(2)}`,
  description: "Sales less food cost today",
},
{
  title: "Gross margin",
  value: `${grossMarginToday.toFixed(1)}%`,
  description: "Gross profit as a percentage of sales",
},
        ].map((card) => (
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
	  
	  <section
  aria-label="Restaurant activity metrics"
  className="mt-4 grid gap-4 sm:grid-cols-2"
>
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm font-medium text-slate-500">
      Average sale
    </p>

    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
      {business.baseCurrency}{" "}
      {averageSaleValue.toFixed(2)}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      Average completed sale today
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm font-medium text-slate-500">
      Completed sales
    </p>

    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
      {salesToday.length}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      Completed sales recorded today
    </p>
  </div>
</section>

<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
  <div className="mb-5">
    <h2 className="font-semibold text-slate-900">
      Today&apos;s sales breakdown
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Menu item sales from completed transactions today.
    </p>
  </div>

  {dailySalesItems.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No menu item sales today
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Completed restaurant sales will appear here.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="pb-3 font-medium">
              Menu item
            </th>

            <th className="pb-3 text-right font-medium">
              Quantity
            </th>

            <th className="pb-3 text-right font-medium">
              Revenue
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
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Get common restaurant tasks done quickly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
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
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
  <h2 className="font-semibold text-slate-900">
    Restaurant performance
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    Today&apos;s operating performance.
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2">
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Sales
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {salesTodayTotal.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Food cost
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {foodCostToday.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Gross profit
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {grossProfitToday.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Gross margin
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {grossMarginToday.toFixed(1)}%
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Average sale
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {business.baseCurrency}{" "}
        {averageSaleValue.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Completed sales
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {salesToday.length}
      </p>
    </div>
  </div>
</div>
	  
	  <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
  <div className="mb-5">
    <h2 className="font-semibold text-slate-900">
      Top-selling menu items
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Best-selling restaurant items today.
    </p>
  </div>

  {topSellingMenuItems.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No menu item sales today
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Completed restaurant sales will appear here.
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {index + 1}
              </span>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity} sold
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

<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
  <div className="mb-5">
    <h2 className="font-semibold text-slate-900">
      Recent sales
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Latest completed restaurant sales.
    </p>
  </div>

  {completedSalesToday.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No completed sales today
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Completed sales will appear here.
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
            className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {sale.referenceNumber}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {sale.items.length}{" "}
                {sale.items.length === 1
                  ? "item"
                  : "items"}
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

<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
  <div className="mb-5">
    <h2 className="font-semibold text-slate-900">
      Low-stock ingredients
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Ingredients that may need replenishment.
    </p>
  </div>

  {!costingWarehouse ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No active warehouse
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Add an active warehouse to monitor ingredient stock.
      </p>
    </div>
  ) : lowStockIngredients.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No low-stock ingredients
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Current ingredient balances are above the warning threshold.
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
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Replenish
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
  <div className="mb-5">
    <h2 className="font-semibold text-slate-900">
      Menu profitability
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Menu items ranked by gross profit.
    </p>
  </div>

  {menuProfitability.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        No menu profitability data
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Add recipes and inventory costs to calculate profitability.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="pb-3 font-medium">
              Menu item
            </th>
            <th className="pb-3 text-right font-medium">
              Selling price
            </th>
            <th className="pb-3 text-right font-medium">
              Food cost
            </th>
            <th className="pb-3 text-right font-medium">
              Gross profit
            </th>
            <th className="pb-3 text-right font-medium">
              Margin
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