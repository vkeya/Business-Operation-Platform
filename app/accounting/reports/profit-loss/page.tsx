import { getProfitLoss } from "@/lib/accounting/reporting/profitLoss";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";

export const dynamic = "force-dynamic";

export default async function ProfitLossPage() {
  const business =
    await getCurrentBusiness();

  const report =
    await getProfitLoss(
      business.id,
    );


  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Accounting / Reports
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Profit & Loss
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Revenue, expenses and business profitability.
        </p>
      </div>


      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Revenue
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.revenue.toLocaleString()}
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Expenses
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.expenses.toLocaleString()}
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Net Profit
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.profit.toLocaleString()}
          </p>
        </div>
      </section>


      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Summary
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          Revenue minus expenses represents the current
          operating profit.
        </p>
      </section>
    </div>
  );
}