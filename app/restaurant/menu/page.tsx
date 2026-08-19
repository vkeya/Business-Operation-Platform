import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function RestaurantMenuPage() {
  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }

  const menus =
    await restaurantMenuService.listMenus(
      business.id,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Restaurant
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Menu
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Manage the menus and customer-facing items offered by your
          restaurant.
        </p>
      </div>

      {menus.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-900">
              No menus yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Create your first restaurant menu to start adding menu
              items.
            </p>
          
		  
		  <div className="mt-6">
  <Link
    href="/restaurant/menu/new"
    className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
  >
    Create menu
  </Link>
 </div>
</div>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
  <Link
    key={menu.id}
    href={`/restaurant/menu/${menu.id}`}
    className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
  >
    <p className="font-semibold text-slate-900">
      {menu.name}
    </p>

    {menu.description && (
      <p className="mt-2 text-sm leading-5 text-slate-500">
        {menu.description}
      </p>
    )}

    <p className="mt-4 text-xs text-slate-500">
      {menu.items.length}{" "}
      {menu.items.length === 1
        ? "item"
        : "items"}
    </p>
  </Link>
))}
        </section>
      )}
    </div>
  );
}