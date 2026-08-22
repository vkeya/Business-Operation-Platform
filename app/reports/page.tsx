import {
  getBusinessReportAction,
} from "@/lib/reports/actions";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report =
    await getBusinessReportAction();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Analytics
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Understand your business performance using your sales,
          costs and inventory data.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-4">
        <ReportCard
          title="Revenue"
          value={report.sales.amount}
          description={`${report.sales.count} completed sales`}
        />

        <ReportCard
          title="Purchases"
          value={report.purchases.amount}
          description={`${report.purchases.count} received purchases`}
        />

        <ReportCard
          title="Expenses"
          value={report.expenses.amount}
          description={`${report.expenses.count} expenses recorded`}
        />

        <ReportCard
          title="Profit estimate"
          value={report.profit}
          description="Revenue - purchases - expenses"
        />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Sales performance
          </h2>

          <div className="mt-5 rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total revenue
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {report.sales.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Inventory position
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Units
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {report.inventory.units.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Stock value
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {report.inventory.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


function ReportCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}