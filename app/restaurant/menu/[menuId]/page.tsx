import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCurrentBusiness,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import { recipeService } from "@/lib/restaurant/recipeService";

interface RestaurantMenuPageProps {
  params: Promise<{
    menuId: string;
  }>;
}

export default async function RestaurantMenuDetailPage({
  params,
}: RestaurantMenuPageProps) {
  const { menuId } = await params;

  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }

  const menu = await restaurantMenuService.findMenuById(
    business.id,
    menuId,
  );

  const warehouses = await getCurrentBusinessWarehouses(
    business.id,
  );

  const warehouse = warehouses[0];

  const itemsWithProfitability = await Promise.all(
    menu.items.map(async (item) => {
      if (!warehouse) {
        return {
          item,
          recipeCost: null,
          grossProfit: null,
          grossMargin: null,
        };
      }

      const recipe =
        await recipeService.findRecipeByMenuItemId(
          business.id,
          item.id,
        );

      if (!recipe || recipe.ingredients.length === 0) {
        return {
          item,
          recipeCost: null,
          grossProfit: null,
          grossMargin: null,
        };
      }

      const recipeCost =
        await recipeService.calculateRecipeCost({
          businessId: business.id,
          menuItemId: item.id,
          warehouseId: warehouse.id,
        });

      const sellingPrice = Number(item.sellingPrice);

      const grossProfit =
        sellingPrice - recipeCost.totalCost;

      const grossMargin =
        sellingPrice > 0
          ? (grossProfit / sellingPrice) * 100
          : 0;

      return {
        item,
        recipeCost: recipeCost.totalCost,
        grossProfit,
        grossMargin,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10">
        <Link
          href="/restaurant/menu"
          className="inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <span aria-hidden="true" className="mr-2">
            ←
          </span>
          Menus
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Restaurant / Menu
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {menu.name}
            </h1>

            {menu.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                {menu.description}
              </p>
            )}
          </div>

          <Link
            href={`/restaurant/menu/${menu.id}/items/new`}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Add menu item
            <span
              className="ml-2 text-emerald-400"
              aria-hidden="true"
            >
              +
            </span>
          </Link>
        </div>
      </div>

      {menu.items.length === 0 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-semibold text-emerald-600">
              +
            </div>

            <p className="mt-5 font-semibold text-slate-950">
              No menu items yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add dishes, drinks or other items offered on this menu.
            </p>

            <div className="mt-6">
              <Link
                href={`/restaurant/menu/${menu.id}/items/new`}
                className="inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Add your first menu item
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Menu items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {menu.items.length}{" "}
                {menu.items.length === 1
                  ? "item"
                  : "items"}{" "}
                in this menu
              </p>
            </div>

            {warehouse && (
              <p className="text-xs font-medium text-slate-400">
                Costing warehouse: {warehouse.name}
              </p>
            )}
          </div>

          {!warehouse && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <span className="mt-0.5 font-semibold">
                !
              </span>

              <div>
                <p className="font-semibold">
                  Warehouse required for costing
                </p>

                <p className="mt-1 text-amber-700">
                  Add an active warehouse to calculate menu item
                  profitability.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itemsWithProfitability.map(
              ({
                item,
                recipeCost,
                grossProfit,
                grossMargin,
              }) => (
                <Link
                  key={item.id}
                  href={`/restaurant/menu/${menu.id}/items/${item.id}`}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                        {item.name}
                      </h3>

                      {item.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">
                          No description added.
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {item.currency}{" "}
                      {item.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={
                        item.isAvailable
                          ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                      }
                    >
                      <span
                        className={
                          item.isAvailable
                            ? "mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"
                            : "mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400"
                        }
                      />
                      {item.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>

                    <span className="text-sm font-semibold text-slate-300 transition-colors group-hover:text-emerald-500">
                      →
                    </span>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    {recipeCost !== null ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Recipe cost
                          </p>

                          <p className="mt-1.5 text-sm font-semibold text-slate-950">
                            {business.baseCurrency}{" "}
                            {recipeCost.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Gross profit
                          </p>

                          <p className="mt-1.5 text-sm font-semibold text-slate-950">
                            {business.baseCurrency}{" "}
                            {grossProfit!.toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Gross margin
                            </p>

                            <p className="text-sm font-semibold text-slate-950">
                              {grossMargin!.toFixed(1)}%
                            </p>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    grossMargin!,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                        <p className="text-xs font-semibold text-amber-700">
                          No recipe costing available
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Add a recipe and ingredients to calculate
                          profitability.
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}