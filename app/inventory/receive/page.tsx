import Link from "next/link";
import ReceiveStockForm from "./ReceiveStockForm";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";

export default async function ReceiveStockPage() {
 const business = await getCurrentBusiness();

const [products, warehouses] =
  await Promise.all([
    productService.listProducts(business.id),
    prisma.warehouse.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
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
          Receive Stock
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Add received stock to a warehouse and update its
          inventory balance.
        </p>
      </div>

<ReceiveStockForm
  products={products}
  warehouses={warehouses}
/>
    </div>
  );
}