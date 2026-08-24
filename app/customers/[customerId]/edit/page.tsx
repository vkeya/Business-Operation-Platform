import Link from "next/link";
import { notFound } from "next/navigation";
import CustomerForm from "../../CustomerForm";
import { getCustomerAction } from "@/lib/customers/actions";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{
    customerId: string;
  }>;
}) {
  const { customerId } = await params;

  const customer =
    await getCustomerAction(customerId);

  if (!customer) {
    notFound();
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href={`/customers/${customer.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← {customer.name}
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          {t.customers.editCustomer}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.customers.editCustomer}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {t.customers.updateCustomerInformation}
        </p>
      </div>

      <CustomerForm
        mode="edit"
        translations={t}
        customer={{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          taxNumber: customer.taxNumber,
          creditLimit: customer.creditLimit,
          currency: customer.currency,
          isActive: customer.isActive,
        }}
      />
    </div>
  );
}