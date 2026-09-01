import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";
import {
  getTranslations,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import AdjustStockForm from "./AdjustStockForm";

export const dynamic = "force-dynamic";

export default async function AdjustStockPage() {
  const business =
    await getCurrentBusiness();

  const locale = await getLocale();
  const t = getTranslations(locale);

  const [products, warehouses] =
    await Promise.all([
      productService.listProducts(
        business.id,
      ),
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
          ← {t.inventory.title}
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t.inventory.title}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.inventory.adjustStock}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {t.inventory.adjustStockPageDescription}
        </p>
      </div>

      <AdjustStockForm
        products={products}
        warehouses={warehouses}
        translations={t}
      />
    </div>
  );
}