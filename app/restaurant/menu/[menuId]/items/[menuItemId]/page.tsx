import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";

interface MenuItemPageProps {
  params: Promise<{
    menuId: string;
    menuItemId: string;
  }>;
}

export default async function RestaurantMenuItemPage({
  params,
}: MenuItemPageProps) {
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
    await restaurantMenuService.findMenuItemById(
      business.id,
      menuItemId,
    );

  if (!menuItem || menuItem.menuId !== menuId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href={`/restaurant/menu/${menuId}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← {menuItem.menu.name}
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">
            Restaurant / Menu Item
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {menuItem.name}
          </h1>

          {menuItem.description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {menuItem.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Menu item
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selling price
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {menuItem.currency}{" "}
                {menuItem.sellingPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Availability
              </p>

              <p
                className={
                  menuItem.isAvailable
                    ? "mt-1 text-sm font-medium text-emerald-700"
                    : "mt-1 text-sm font-medium text-slate-500"
                }
              >
                {menuItem.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </p>
            </div>

            {menuItem.product && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Inventory product
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {menuItem.product.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {menuItem.product.sku}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Operations
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage the recipe used to prepare this menu item.
          </p>

          <div className="mt-5">
            <Link
              href={`/restaurant/menu/${menuId}/items/${menuItemId}/recipe`}
              className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Manage recipe
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}