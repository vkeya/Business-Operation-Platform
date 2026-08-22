import {
  getAccountsAction,
  initializeAccountsAction,
} from "@/lib/accounting/actions";
import { getAccountingMetrics } from "@/lib/accounting/dashboard/accountingMetrics";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const business =
    await getCurrentBusiness();

  const accounts =
    await getAccountsAction();

  const metrics =
    await getAccountingMetrics(
      business.id,
    );
	
	

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Finance / Accounting
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Accounting
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage your chart of accounts and financial structure.
          </p>
        </div>

        <form
          action={initializeAccountsAction}
        >
          <button
            type="submit"
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Initialize accounts
          </button>
        </form>
      </div>

<section className="mb-8 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Revenue
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.revenue.toLocaleString()}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Expenses
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.expenses.toLocaleString()}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Profit
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.profit.toLocaleString()}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Cash
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.cashPosition.toLocaleString()}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Receivables
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.receivables.toLocaleString()}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">
      Payables
    </p>
    <p className="mt-2 text-2xl font-semibold">
      {metrics.payables.toLocaleString()}
    </p>
  </div>
</section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Chart of accounts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Accounts used to organize your financial records.
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              No accounts configured
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Initialize the default chart of accounts to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    System
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {account.code}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {account.name}
                      </p>

                      {account.description && (
                        <p className="mt-1 text-xs text-slate-500">
                          {account.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {account.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {account.isSystem
                        ? "Yes"
                        : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}