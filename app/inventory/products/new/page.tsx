import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import NewProductForm from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return <NewProductForm translations={t} />;
}