export const dynamic = "force-dynamic";

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Finance
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Payments
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Track money received from customers and payments made to suppliers.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Customer payments
          </p>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            Coming soon
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Supplier payments
          </p>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            Coming soon
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Outstanding balances
          </p>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            Coming soon
          </p>
        </div>
      </section>
    </div>
  );
}