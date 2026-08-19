import Link from "next/link";
import { getProductsAction } from "./listActions";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const products = await getProductsAction();

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE",
  );

  const trackedProducts = products.filter(
    (product) => product.trackInventory,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Stock / Products
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage the products and services your business sells.
          </p>
        </div>

        <Link
          href="/inventory/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add product
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Products
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {products.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Products and services
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Active
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {activeProducts.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Currently available
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Stock tracked
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {trackedProducts.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Products with inventory tracking
          </p>
        </div>
      </section>

<section className="mt-8 rounded-2xl border border-slate-200 bg-white">
  <ProductList products={products} />
</section>
    </div>
  );
}