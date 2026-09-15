import Link from "next/link";

import { getArchivedProductsAction } from "../listActions";
import ArchivedProductList from "./ArchivedProductList";

export const dynamic = "force-dynamic";

export default async function ArchivedProductsPage() {
  const products =
    await getArchivedProductsAction();

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <ArchivedProductList products={products} />
</section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              —
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              No archived products
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Archived products will appear here when they are removed from
              active inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Product
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    SKU
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Barcode
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                        {product.sku}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-600">
                        {product.barcode || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        ARCHIVED
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/inventory/products/${product.id}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-950 hover:text-white"
                      >
                        View Product
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}