import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";

const stockActions = [
  {
    title: "Add product",
    description: "Create a product or service.",
    href: "/inventory/products/new",
  },
  {
    title: "Receive stock",
    description: "Record products coming into your business.",
    href: "/inventory/receive",
  },
  {
    title: "Adjust stock",
    description: "Correct a stock quantity when needed.",
    href: "/inventory/adjust",
  },
  {
    title: "Transfer stock",
    description: "Move stock between warehouses.",
    href: "/inventory/transfer",
  },
];

const stockSections = [
  {
    title: "Products",
    description: "Manage the products and services you sell.",
  },
  {
    title: "Stock levels",
    description: "See what you currently have available.",
  },
  {
    title: "Stock movements",
    description: "See what came in, went out or changed.",
  },
];

export default async function InventoryPage() {
  const business =
  await getCurrentBusiness();

const balances =
  await inventoryService.listBalances(
    business.id,
  );

const products =
  await productService.listProducts(
    business.id,
  );

  const warehouses =
  await prisma.warehouse.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const stockRows = balances
  .map((balance) => {
    const product = products.find(
      (item) =>
        item.id === balance.productId,
    );

    const warehouse = warehouses.find(
      (item) =>
        item.id === balance.warehouseId,
    );

    if (!product || !warehouse) {
      return null;
    }

    return {
      id: balance.id,
      productName: product.name,
      sku: product.sku,
      warehouseName: warehouse.name,
      warehouseCode: warehouse.code,
      quantity: balance.quantity,
      averageCost: balance.averageCost,
      currency: balance.currency,
    };
  })
  .filter(
    (
      row,
    ): row is NonNullable<typeof row> =>
      row !== null,
  );

  const inventoryProducts =
  products.filter(
    (product) =>
      product.type === "PRODUCT" &&
      product.trackInventory,
  );

const totalUnitsInStock =
  balances.reduce(
    (total, balance) =>
      total + balance.quantity,
    0,
  );

const lowStockCount =
  inventoryProducts.filter((product) => {
    if (
      product.minimumStock === null &&
      product.reorderLevel === null
    ) {
      return false;
    }

    const productQuantity =
      balances
        .filter(
          (balance) =>
            balance.productId ===
            product.id,
        )
        .reduce(
          (total, balance) =>
            total + balance.quantity,
          0,
        );

    const threshold =
      product.reorderLevel ??
      product.minimumStock ??
      0;

    return productQuantity <= threshold;
  }).length;

  const stockAlerts = inventoryProducts
  .map((product) => {
    const quantity =
      balances
        .filter(
          (balance) =>
            balance.productId ===
            product.id,
        )
        .reduce(
          (total, balance) =>
            total + balance.quantity,
          0,
        );

    const threshold =
      product.reorderLevel ??
      product.minimumStock;

    if (
      threshold === null ||
      threshold === undefined
    ) {
      return null;
    }

    if (quantity <= 0) {
      return {
        product,
        quantity,
        threshold,
        status: "OUT_OF_STOCK" as const,
      };
    }

    if (quantity <= threshold) {
      return {
        product,
        quantity,
        threshold,
        status: "LOW_STOCK" as const,
      };
    }

    return null;
  })
  .filter(
    (
      alert,
    ): alert is NonNullable<
      typeof alert
    > => alert !== null,
  );



  const stockValueByCurrency =
  balances.reduce<Record<string, number>>(
    (totals, balance) => {
      const value =
        balance.quantity *
        balance.averageCost;

      totals[balance.currency] =
        (totals[balance.currency] ?? 0) +
        value;

      return totals;
    },
    {},
  );

  const stockValueEntries =
  Object.entries(stockValueByCurrency);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Stock
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Manage your stock
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Keep track of what you have, what is moving and what needs
          attention.
        </p>
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common stock tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stockActions.map((action) => (
            <Link
  key={action.title}
  href={action.href}
  className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm"
>
  <p className="font-medium text-slate-900">
    {action.title}
  </p>

  <p className="mt-2 text-sm leading-5 text-slate-500">
    {action.description}
  </p>

  <p className="mt-4 text-sm font-medium text-slate-700">
    Open →
  </p>
</Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Stock management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Everything you need to manage your products and stock.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="font-semibold text-slate-900">
      Products
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Manage the products and services you sell.
    </p>

    <div className="mt-5 rounded-xl bg-slate-50 p-4">
      <p className="text-2xl font-semibold text-slate-900">
        {products.length}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        products and services
      </p>
    </div>

    <Link
      href="/inventory/products"
      className="mt-5 inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
    >
      Manage products →
    </Link>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="font-semibold text-slate-900">
      Stock levels
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      See what you currently have available.
    </p>

    <div className="mt-5 rounded-xl bg-slate-50 p-4">
      {stockRows.length === 0 ? (
        <p className="text-sm text-slate-500">
          No stock records yet
        </p>
      ) : (
        <div className="space-y-3">
          {stockRows.slice(0, 5).map((row) => (
            <div
              key={row.id}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {row.productName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {row.sku} · {row.warehouseName}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {row.quantity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="font-semibold text-slate-900">
      Stock movements
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Review receipts, transfers, adjustments and other movements.
    </p>

    <div className="mt-5 rounded-xl bg-slate-50 p-4">
      <p className="text-2xl font-semibold text-slate-900">
        View history
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Review inventory activity
      </p>
    </div>

    <Link
      href="/inventory/history"
      className="mt-5 inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
    >
      View movements →
    </Link>
  </div>
</div>


      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Stock attention
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Products that may need replenishment.
            </p>
          </div>

          {stockAlerts.length > 0 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {stockAlerts.length}{" "}
              {stockAlerts.length === 1
                ? "item"
                : "items"}{" "}
              need attention
            </span>
          )}
        </div>

        <div className="mt-6">
          {stockAlerts.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-900">
                Stock levels look healthy
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No products are currently below their configured stock threshold.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
              {stockAlerts.map((alert) => (
                <div
                  key={alert.product.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {alert.product.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {alert.product.sku}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {alert.quantity}
                      </p>

                      <p className="text-xs text-slate-500">
                        threshold {alert.threshold}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {alert.status ===
                      "OUT_OF_STOCK"
                        ? "Out of stock"
                        : "Low stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Stock overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your live stock levels will appear here.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Getting started
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Products
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {inventoryProducts.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Units in stock
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalUnitsInStock}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Low stock
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {lowStockCount}
            </p>
          </div>

		  <div className="rounded-xl bg-slate-50 p-5">
  <p className="text-sm text-slate-500">
    Stock value
  </p>

  <div className="mt-2 space-y-1">
    {stockValueEntries.length === 0 ? (
      <p className="text-2xl font-semibold text-slate-900">
        —
      </p>
    ) : (
      stockValueEntries.map(
        ([currency, value]) => (
          <p
            key={currency}
            className="text-xl font-semibold text-slate-900"
          >
            {currency}{" "}
            {value.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>
        ),
      )
    )}
  </div>
</div>

        </div>
      </section>
    </div>
  );
}