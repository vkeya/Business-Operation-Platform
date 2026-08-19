import Link from "next/link";
import { getInventoryMovementsAction } from "../action";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";

export default async function InventoryHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
  type?: string;
  productId?: string;
  warehouseId?: string;
}>;
}) {
  const params = await searchParams;
  
  const business =
  await getCurrentBusiness();

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

  const allowedMovementTypes = [
  "RECEIPT",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "DAMAGE",
  "EXPIRY",
] as const;

const movementType =
  allowedMovementTypes.includes(
    params.type as (typeof allowedMovementTypes)[number],
  )
    ? (params.type as (typeof allowedMovementTypes)[number])
    : undefined;

  const movements =
  await getInventoryMovementsAction(
    params.productId || undefined,
    params.warehouseId || undefined,
    movementType,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <Link
          href="/inventory"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Inventory
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          Inventory
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Movement History
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review receipts, adjustments, and other inventory
          movements.
        </p>
      </div>
	  
	  <div className="mt-6 flex flex-wrap gap-2">
  <Link
    href="/inventory/history"
    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
      !movementType
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 text-slate-700 hover:bg-slate-50"
    }`}
  >
    All
  </Link>

  {allowedMovementTypes.map((type) => (
    <Link
      key={type}
      href={`/inventory/history?type=${type}`}
      className={`rounded-xl border px-4 py-2 text-sm font-medium ${
        movementType === type
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {type.replaceAll("_", " ")}
    </Link>
  ))}
</div>

<div className="mt-3 flex flex-wrap gap-2">
  <Link
    href={
      movementType
        ? `/inventory/history?type=${movementType}`
        : "/inventory/history"
    }
    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
      !params.productId
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 text-slate-700 hover:bg-slate-50"
    }`}
  >
    All products
  </Link>

  {products
    .filter(
      (product) =>
        product.type === "PRODUCT" &&
        product.trackInventory,
    )
    .map((product) => {
      const query = new URLSearchParams();

      if (movementType) {
        query.set("type", movementType);
      }

      query.set("productId", product.id);

      return (
        <Link
          key={product.id}
          href={`/inventory/history?${query.toString()}`}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            params.productId === product.id
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {product.name}
        </Link>
      );
    })}
</div>

<div className="mt-3 flex flex-wrap gap-2">
  <Link
    href={(() => {
      const query = new URLSearchParams();

      if (movementType) {
        query.set("type", movementType);
      }

      if (params.productId) {
        query.set(
          "productId",
          params.productId,
        );
      }

      const queryString =
        query.toString();

      return queryString
        ? `/inventory/history?${queryString}`
        : "/inventory/history";
    })()}
    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
      !params.warehouseId
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 text-slate-700 hover:bg-slate-50"
    }`}
  >
    All warehouses
  </Link>

  {warehouses.map((warehouse) => {
    const query = new URLSearchParams();

    if (movementType) {
      query.set("type", movementType);
    }

    if (params.productId) {
      query.set(
        "productId",
        params.productId,
      );
    }

    query.set(
      "warehouseId",
      warehouse.id,
    );

    return (
      <Link
        key={warehouse.id}
        href={`/inventory/history?${query.toString()}`}
        className={`rounded-xl border px-4 py-2 text-sm font-medium ${
          params.warehouseId === warehouse.id
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {warehouse.name}
      </Link>
    );
  })}
</div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {movements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              No inventory movements yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Stock receipts and adjustments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
				  
				  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Product
</th>

<th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Warehouse
</th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Unit cost
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total cost
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(
                        movement.createdAt,
                      ).toLocaleString()}
                    </td>
					
					<td className="px-6 py-4">
  <p className="text-sm font-medium text-slate-900">
    {movement.product.name}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {movement.product.sku}
  </p>
</td>

<td className="px-6 py-4">
  <p className="text-sm font-medium text-slate-900">
    {movement.warehouse.name}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {movement.warehouse.code}
  </p>
</td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {movement.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {movement.quantity}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {movement.unitCost ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {movement.totalCost ?? "—"}
                    </td>

                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                      {movement.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}