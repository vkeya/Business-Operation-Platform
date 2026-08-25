import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import NewSupplierForm from "./NewSupplierForm";

export const dynamic = "force-dynamic";

export default async function NewSupplierPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return <NewSupplierForm translations={t} />;
}