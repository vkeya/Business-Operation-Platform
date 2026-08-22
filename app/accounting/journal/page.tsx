import {
  getJournalEntriesAction,
} from "@/lib/accounting/journalActions";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries =
    await getJournalEntriesAction();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Accounting / Journal
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Journal Entries
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review posted financial transactions.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {entries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              No journal entries yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Financial transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Debit
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Credit
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => {
                  const debit =
                    entry.lines.reduce(
                      (total, line) =>
                        total +
                        line.debit.toNumber(),
                      0,
                    );

                  const credit =
                    entry.lines.reduce(
                      (total, line) =>
                        total +
                        line.credit.toNumber(),
                      0,
                    );

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {entry.reference}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {entry.description}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(
                          entry.entryDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {debit.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {credit.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}