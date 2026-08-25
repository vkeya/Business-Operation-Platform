import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return <SetupForm translations={t} />;
}