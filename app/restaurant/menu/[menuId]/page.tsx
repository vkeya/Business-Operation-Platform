import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";

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
              Add dishes, drinks or other items offered on this menu.
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.items.map((item) => (
              <Link
  key={item.id}
  href={`/restaurant/menu/${menu.id}/items/${item.id}/recipe`}
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
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}