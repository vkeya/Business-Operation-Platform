import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import ServiceForm from "./ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const business = await getCurrentBusiness();

  if (business.type !== "boutique") {
    notFound();
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href="/services"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← {t.services.title}
        </Link>

        <p className="mt-5 text-sm font-medium text-emerald-600">
          {t.services.serviceCatalogueLabel}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.services.addService}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {t.services.description}
        </p>
      </div>

      <ServiceForm translations={t} />
    </div>
  );
}