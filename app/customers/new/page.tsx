import Link from "next/link";
import CustomerForm from "../CustomerForm";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export default async function NewCustomerPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/customers"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← {t.navigation.customers}
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t.customers.newCustomer}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.customers.addCustomer}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {t.customers.createCustomerRecord}
        </p>
      </div>

      <CustomerForm
  mode="create"
  translations={t}
/>
    </div>
  );
}