import ExpenseForm from "./ExpenseForm";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const business =
    await getCurrentBusiness();

  const locale = await getLocale();
const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          {t.expenses.finance}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {t.expenses.newExpense}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {t.expenses.newExpenseDescription}
        </p>
      </div>

      <ExpenseForm
        currency={business.baseCurrency}
        translations={t}
      />
    </div>
  );
}