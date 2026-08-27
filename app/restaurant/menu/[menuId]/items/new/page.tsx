import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  getRestaurantMenuAction,
  getRestaurantMenuProductsAction,
} from "@/app/restaurant/actions";
import MenuItemForm from "../MenuItemForm";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

interface NewMenuItemPageProps {
  params: Promise<{
    menuId: string;
  }>;
}

export default async function NewMenuItemPage({
  params,
}: NewMenuItemPageProps) {
  const { menuId } = await params;

  const locale = await getLocale();
const translations = getTranslations(locale);

  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    notFound();
  }

  const [menu, products] =
    await Promise.all([
      getRestaurantMenuAction(menuId),
      getRestaurantMenuProductsAction(),
    ]);

  if (!menu) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Restaurant / {menu.name}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Add menu item
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Add a dish, drink or other item to this menu.
        </p>
      </div>

      <MenuItemForm
  menuId={menuId}
  currency={business.baseCurrency}
  products={products}
  translations={translations}
/>
    </div>
  );
}