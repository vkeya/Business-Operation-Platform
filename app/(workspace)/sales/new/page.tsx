import { productService } from "@/lib/inventory/productService";
import SaleForm from "./SaleForm";
import {
  getCurrentBusiness,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import {
  getTranslations,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const business =
    await getCurrentBusiness();

  const locale =
    await getLocale();

  const t =
    getTranslations(locale);

  const products =
    await productService.listProducts(
      business.id,
    );

  const warehouses =
    await getCurrentBusinessWarehouses(
      business.id,
    );

  const restaurantMenuItems =
    business.type === "restaurant"
      ? await restaurantMenuService.listAvailableMenuItems(
          business.id,
        )
      : [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          {t.saleForm.breadcrumb}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.saleForm.recordSaleTitle}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {t.saleForm.recordSaleDescription}
        </p>
      </div>

      <SaleForm
  products={products}
  warehouses={warehouses}
  restaurantMenuItems={restaurantMenuItems}
  currency={business.baseCurrency}
  translations={t}
/>
    </div>
  );
}