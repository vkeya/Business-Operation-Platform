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

  const business =
    await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }

  const menu =
    await restaurantMenuService.findMenuById(
      business.id,
      menuId,
    );

  const warehouses =
    await getCurrentBusinessWarehouses(
      business.id,
    );

  const warehouse =
    warehouses[0];

  const itemsWithProfitability =
    await Promise.all(
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

        if (
          !recipe ||
          recipe.ingredients.length === 0
        ) {
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

        const sellingPrice =
          Number(item.sellingPrice);

        const grossProfit =
          sellingPrice -
          recipeCost.totalCost;

        const grossMargin =
          sellingPrice > 0
            ? (grossProfit / sellingPrice) * 100
            : 0;

        return {
          item,
          recipeCost:
            recipeCost.totalCost,
          grossProfit,
          grossMargin,
        };
      }),
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <Link
          href="/restaurant/menu"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Menus
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Restaurant / Menu
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {menu.name}
            </h1>

            {menu.description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {menu.description}
              </p>
            )}
          </div>

          <Link
            href={`/restaurant/menu/${menu.id}/items/new`}
            className="inline-flex w-fit rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add menu item
          </Link>
        </div>
      </div>

      {menu.items.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-900">
              No menu items yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add dishes, drinks or other items offered
              on this menu.
            </p>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Menu items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {menu.items.length}{" "}
              {menu.items.length === 1
                ? "item"
                : "items"}
            </p>
          </div>

          {!warehouse && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Add an active warehouse to calculate
              menu item profitability.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="mt-2 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {item.currency}{" "}
                      {item.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <span
                      className={
                        item.isAvailable
                          ? "text-xs font-medium text-emerald-700"
                          : "text-xs font-medium text-slate-500"
                      }
                    >
                      {item.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {recipeCost !== null ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Recipe cost
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {business.baseCurrency}{" "}
                            {recipeCost.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Gross profit
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {business.baseCurrency}{" "}
                            {grossProfit!.toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                              Gross margin
                            </p>

                            <p className="text-sm font-semibold text-slate-900">
                              {grossMargin!.toFixed(1)}%
                            </p>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-900"
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
                      <div>
                        <p className="text-xs font-medium text-amber-700">
                          No recipe costing available
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Add a recipe and ingredients to
                          calculate profitability.
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