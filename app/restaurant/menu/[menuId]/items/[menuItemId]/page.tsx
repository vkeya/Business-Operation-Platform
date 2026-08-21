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

  const business = await getCurrentBusiness();

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10">
        <Link
          href={`/restaurant/menu/${menuId}`}
          className="inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <span aria-hidden="true" className="mr-2">
            ←
          </span>
          {menuItem.menu.name}
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-emerald-600">
            Restaurant / Menu Item
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {menuItem.name}
              </h1>

              {menuItem.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {menuItem.description}
                </p>
              )}
            </div>

            <span
              className={
                menuItem.isAvailable
                  ? "inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                  : "inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
              }
            >
              <span
                className={
                  menuItem.isAvailable
                    ? "mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"
                    : "mr-2 h-1.5 w-1.5 rounded-full bg-slate-400"
                }
              />

              {menuItem.isAvailable
                ? "Available"
                : "Unavailable"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Menu item
              </p>

              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Item details
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-600">
              M
            </div>
          </div>

          <div className="mt-7 divide-y divide-slate-100">
            <div className="pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Selling price
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {menuItem.currency}{" "}
                {menuItem.sellingPrice.toFixed(2)}
              </p>
            </div>

            <div className="py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Availability
              </p>

              <p
                className={
                  menuItem.isAvailable
                    ? "mt-2 text-sm font-semibold text-emerald-700"
                    : "mt-2 text-sm font-semibold text-slate-500"
                }
              >
                {menuItem.isAvailable
                  ? "Available for sale"
                  : "Currently unavailable"}
              </p>
            </div>

            {menuItem.product && (
              <div className="pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Inventory product
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {menuItem.product.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {menuItem.product.sku}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            R
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Operations
          </p>

          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Recipe & costing
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Manage the recipe used to prepare this menu item,
            including its ingredients and costing.
          </p>

          <div className="mt-7">
            <Link
              href={`/restaurant/menu/${menuId}/items/${menuItemId}/recipe`}
              className="group inline-flex items-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Manage recipe
              <span
                className="ml-2 text-emerald-400 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}