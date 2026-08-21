import ExpenseForm from "./ExpenseForm";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const business =
    await getCurrentBusiness();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Finance
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Record expense
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Record a business expense and track its payment status.
        </p>
      </div>

      <ExpenseForm
        currency={business.baseCurrency}
      />
    </div>
  );
}