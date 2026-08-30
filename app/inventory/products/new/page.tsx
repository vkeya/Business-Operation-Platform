import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getProductConfiguration } from "@/lib/business/productConfiguration";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import type { BusinessType } from "@/types";
import NewProductForm from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const business = await getCurrentBusiness();

  const configuration =
    getProductConfiguration(
      business.type as BusinessType,
    );

  const categories =
    await productCategoryService.listCategories(
      business.id,
    );

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <NewProductForm
      translations={t}
      configuration={configuration}
      categories={categories}
    />
  );
}