import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getCashFlow } from "@/lib/accounting/reporting/cashFlow";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const business =
    await getCurrentBusiness();

  const report =
    await getCashFlow(
      business.id,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Accounting / Reports
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Cash Flow
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Track money coming into and leaving your business.
        </p>
      </div>


      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Cash In
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.cashIn.toLocaleString()}
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Cash Out
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.cashOut.toLocaleString()}
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Net Movement
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {report.netCashMovement.toLocaleString()}
          </p>
        </div>
      </section>


      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Recent Cash Transactions
        </h2>

        {report.transactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No cash transactions yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {report.transactions
              .slice(0, 10)
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {
                        transaction.journalEntry
                          .description
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        transaction.journalEntry
                          .reference
                      }
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {(
                      transaction.debit.toNumber() -
                      transaction.credit.toNumber()
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}