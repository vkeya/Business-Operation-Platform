import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getRestaurantMenuItemAction } from "@/app/restaurant/actions";
import RecipeForm from "./RecipeForm";

interface NewRecipePageProps {
  params: Promise<{
    menuId: string;
    menuItemId: string;
  }>;
}

export default async function NewRecipePage({
  params,
}: NewRecipePageProps) {
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/restaurant/menu/${menuId}/items/${menuItemId}/recipe`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← {menuItem.name}
        </Link>

        <p className="mt-4 text-sm font-medium text-slate-500">
          Restaurant / Recipe
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create recipe
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Define the recipe used to prepare{" "}
          <span className="font-medium text-slate-900">
            {menuItem.name}
          </span>
          .
        </p>
      </div>

      <RecipeForm
        menuId={menuId}
        menuItemId={menuItemId}
      />
    </div>
  );
}