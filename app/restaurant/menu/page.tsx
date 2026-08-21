import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Restaurant / Menu
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Menus
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the menus and customer-facing items offered by your
            restaurant.
          </p>
        </div>

        <Link
          href="/restaurant/menu/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Create menu
          <span className="ml-2 text-emerald-400" aria-hidden="true">
            +
          </span>
        </Link>
      </div>

      {menus.length === 0 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-semibold text-emerald-600">
              +
            </div>

            <p className="mt-5 font-semibold text-slate-950">
              No menus yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first restaurant menu to start adding dishes,
              drinks and other customer-facing items.
            </p>

            <div className="mt-6">
              <Link
                href="/restaurant/menu/new"
                className="inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Create your first menu
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Your menus
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {menus.length}{" "}
                {menus.length === 1
                  ? "menu"
                  : "menus"}{" "}
                available
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={`/restaurant/menu/${menu.id}`}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-600">
                    M
                  </div>

                  <span className="text-slate-300 transition-colors group-hover:text-emerald-500">
                    →
                  </span>
                </div>

                <p className="mt-6 text-lg font-semibold tracking-tight text-slate-950">
                  {menu.name}
                </p>

                {menu.description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {menu.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    No description added.
                  </p>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Menu items
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {menu.items.length}
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