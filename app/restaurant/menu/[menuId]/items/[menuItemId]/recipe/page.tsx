import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCurrentBusiness,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import {
  getRestaurantMenuItemAction,
  getRestaurantRecipeAction,
} from "@/app/restaurant/actions";
import { getProductsAction } from "@/app/inventory/products/listActions";
import { recipeService } from "@/lib/restaurant/recipeService";
import AddIngredientForm from "./AddIngredientForm";

interface RecipePageProps {
  params: Promise<{
    menuId: string;
    menuItemId: string;
  }>;
}

export default async function RecipePage({
  params,
}: RecipePageProps) {
  const {
    menuId,
    menuItemId,
  } = await params;

  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }

  const menuItem =
    await getRestaurantMenuItemAction(
      menuItemId,
    );

  if (menuItem.menuId !== menuId) {
    notFound();
  }

  const recipe =
    await getRestaurantRecipeAction(
      menuItemId,
    );

  const products =
    await getProductsAction();

  const warehouses =
    await getCurrentBusinessWarehouses(
      business.id,
    );

  let recipeCost:
    | Awaited<
        ReturnType<
          typeof recipeService.calculateRecipeCost
        >
      >
    | null = null;

  if (
    recipe &&
    recipe.ingredients.length > 0 &&
    warehouses.length > 0
  ) {
    recipeCost =
      await recipeService.calculateRecipeCost({
        businessId: business.id,
        menuItemId,
        warehouseId: warehouses[0].id,
      });
  }

  const sellingPrice =
    Number(menuItem.sellingPrice);

  const grossProfit =
    recipeCost
      ? sellingPrice - recipeCost.totalCost
      : 0;

  const grossMargin =
    sellingPrice > 0
      ? (grossProfit / sellingPrice) * 100
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10">
        <Link
          href={`/restaurant/menu/${menuId}/items/${menuItemId}`}
          className="inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <span
            aria-hidden="true"
            className="mr-2"
          >
            ←
          </span>
          {menuItem.name}
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-emerald-600">
            Restaurant / Recipe
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {menuItem.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the recipe, ingredients and costing used
            to prepare this menu item.
          </p>
        </div>
      </div>

      {!recipe ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-semibold text-emerald-600">
              R
            </div>

            <p className="mt-5 font-semibold text-slate-950">
              No recipe yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create a recipe to define the ingredients
              and quantities used for this menu item.
            </p>

            <div className="mt-6">
              <Link
                href={`/restaurant/menu/${menuId}/items/${menuItemId}/recipe/new`}
                className="inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Create recipe
                <span
                  className="ml-2 text-emerald-400"
                  aria-hidden="true"
                >
                  +
                </span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Recipe
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {recipe.name}
                </h2>

                {recipe.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {recipe.description}
                  </p>
                )}
              </div>

              <span
                className={
                  recipe.isActive
                    ? "inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    : "inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
                }
              >
                <span
                  className={
                    recipe.isActive
                      ? "mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"
                      : "mr-2 h-1.5 w-1.5 rounded-full bg-slate-400"
                  }
                />

                {recipe.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                  Recipe composition
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Ingredients
                </h2>
              </div>

              <p className="text-sm text-slate-500">
                {recipe.ingredients.length}{" "}
                {recipe.ingredients.length === 1
                  ? "ingredient"
                  : "ingredients"}
              </p>
            </div>

            {recipe.ingredients.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No ingredients added yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add ingredients below to define the recipe.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid sm:grid-cols-[1fr_auto]">
                  <span>Ingredient</span>
                  <span>Quantity</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {recipe.ingredients.map(
                    (ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {ingredient.product.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Recipe ingredient
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-slate-700">
                          {ingredient.quantity.toString()}{" "}
                          {ingredient.unit}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-slate-100 pt-7">
              <AddIngredientForm
                recipeId={recipe.id}
                menuId={menuId}
                menuItemId={menuItemId}
                products={products}
              />
            </div>
          </section>

          {recipeCost && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    Costing
                  </p>

                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    Recipe economics
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Based on average inventory cost in{" "}
                    {warehouses[0].name}.
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Recipe cost
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {business.baseCurrency}{" "}
                    {recipeCost.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Selling price
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {business.baseCurrency}{" "}
                    {sellingPrice.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Gross profit
                  </p>

                  <p className="mt-2 text-lg font-semibold text-emerald-700">
                    {business.baseCurrency}{" "}
                    {grossProfit.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Gross margin
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {grossMargin.toFixed(1)}%
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            grossMargin,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Ingredient costing
                  </p>
                </div>

                <div className="divide-y divide-slate-100 bg-white">
                  {recipeCost.ingredients.map(
                    (ingredient) => (
                      <div
                        key={ingredient.productId}
                        className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-950">
                            {ingredient.productName}
                          </p>

                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                            <p>
                              Recipe quantity:{" "}
                              <span className="font-medium text-slate-700">
                                {ingredient.recipeQuantity}{" "}
                                {ingredient.recipeUnit}
                              </span>
                            </p>

                            <p>
                              Inventory quantity:{" "}
                              <span className="font-medium text-slate-700">
                                {ingredient.inventoryQuantity}{" "}
                                {ingredient.inventoryUnit}
                              </span>
                            </p>

                            <p>
                              Average cost:{" "}
                              <span className="font-medium text-slate-700">
                                {business.baseCurrency}{" "}
                                {ingredient.averageCost.toFixed(2)}
                              </span>{" "}
                              / {ingredient.inventoryUnit}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-slate-950">
                          {business.baseCurrency}{" "}
                          {ingredient.totalCost.toFixed(2)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          )}

          {recipe &&
            recipe.ingredients.length > 0 &&
            warehouses.length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-semibold text-amber-700">
                    !
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Warehouse required for costing
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Add an active warehouse with inventory
                      before recipe costing can be calculated.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}