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

  const business =
    await getCurrentBusiness();

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
        warehouseId:
          warehouses[0].id,
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href={`/restaurant/menu/${menuId}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← {menuItem.menu.name}
        </Link>

        <p className="mt-4 text-sm font-medium text-slate-500">
          Restaurant / Recipe
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {menuItem.name}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Manage the recipe and ingredients used to
          prepare this menu item.
        </p>
      </div>

      {!recipe ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-900">
              No recipe yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Create a recipe to define the ingredients
              used for this menu item.
            </p>

            <div className="mt-5">
              <Link
                href={`/restaurant/menu/${menuId}/items/${menuItemId}/recipe/new`}
                className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Create recipe
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {recipe.name}
              </h2>

              {recipe.description && (
                <p className="mt-2 text-sm text-slate-500">
                  {recipe.description}
                </p>
              )}
            </div>

            <span className="text-xs font-medium text-emerald-700">
              {recipe.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-slate-900">
              Ingredients
            </h3>

            {recipe.ingredients.length === 0 ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">
                  No ingredients added yet
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {recipe.ingredients.map(
                  (ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {ingredient.product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {ingredient.quantity.toString()}{" "}
                          {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {recipeCost && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Recipe cost
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Based on average inventory cost in{" "}
                      {warehouses[0].name}.
                    </p>
                  </div>

                  <p className="text-xl font-semibold text-slate-900">
                    {business.baseCurrency}{" "}
                    {recipeCost.totalCost.toFixed(2)}
                  </p>
                </div>

				<div className="mt-5 grid gap-4 sm:grid-cols-3">
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-medium text-slate-500">
      Selling price
    </p>

    <p className="mt-1 text-lg font-semibold text-slate-900">
      {business.baseCurrency}{" "}
      {sellingPrice.toFixed(2)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-medium text-slate-500">
      Gross profit
    </p>

    <p className="mt-1 text-lg font-semibold text-slate-900">
      {business.baseCurrency}{" "}
      {grossProfit.toFixed(2)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-medium text-slate-500">
      Gross margin
    </p>

    <p className="mt-1 text-lg font-semibold text-slate-900">
      {grossMargin.toFixed(1)}%
    </p>
  </div>
</div>

                <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {recipeCost.ingredients.map(
                    (ingredient) => (
                      <div
                        key={ingredient.productId}
                        className="flex items-center justify-between gap-4 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {ingredient.productName}
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-slate-500">
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
    </span>
    {" / "}
    {ingredient.inventoryUnit}
  </p>
</div>
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                          {business.baseCurrency}{" "}
                          {ingredient.totalCost.toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {recipe &&
              recipe.ingredients.length > 0 &&
              warehouses.length === 0 && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Add an active warehouse with inventory
                  before recipe costing can be calculated.
                </div>
              )}

            <AddIngredientForm
              recipeId={recipe.id}
              menuId={menuId}
              menuItemId={menuItemId}
              products={products}
            />
          </div>
        </section>
      )}
    </div>
  );
}