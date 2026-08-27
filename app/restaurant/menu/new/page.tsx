import MenuForm from "./MenuForm";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export default async function NewRestaurantMenuPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          {t.restaurantMenu.breadcrumb}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.restaurantMenu.createMenu}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {t.restaurantMenu.createMenuPageDescription}
        </p>
      </div>

      <MenuForm translations={t.restaurantMenu} />
    </div>
  );
}