import {
ArrowDownRight,
ArrowUpRight,
CreditCard,
Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function PaymentsPage() {
const paymentAreas = [
{
title: "Customer payments",
description:
"Track money received from customers and monitor incoming payments.",
status: "Coming soon",
icon: ArrowUpRight,
iconTone: "text-emerald-700",
borderTone: "border-emerald-200",
number: "01",
},
{
title: "Supplier payments",
description:
"Track payments made to suppliers and manage outgoing obligations.",
status: "Coming soon",
icon: ArrowDownRight,
iconTone: "text-blue-700",
borderTone: "border-blue-200",
number: "02",
},
{
title: "Outstanding balances",
description:
"Monitor unpaid and partially paid balances across your business.",
status: "Coming soon",
icon: CreditCard,
iconTone: "text-amber-700",
borderTone: "border-amber-200",
number: "03",
},
];

return ( <div className="space-y-6">
{/* Payments hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            Finance
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
            Payment management
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Payments
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Track money received from customers and payments
          made to suppliers from one financial workspace.
        </p>
      </div>

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
        <Wallet className="h-6 w-6" />
      </div>
    </div>
  </section>

  {/* Payment overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Payment operations
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        Manage business payments
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Keep track of incoming payments, supplier
        obligations and outstanding balances.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {paymentAreas.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className={[
              "rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
              item.borderTone,
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50",
                  item.iconTone,
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span className="text-[10px] font-bold tracking-[0.14em] text-slate-300">
                {item.number}
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
              {item.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {item.description}
            </p>

            <div className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {item.status}
            </div>
          </div>
        );
      })}
    </div>
  </section>

  {/* Payment workspace */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
        <CreditCard className="h-5 w-5" />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Payment workspace
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-900">
          A central place for business payment activity
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Payment management will bring incoming customer
          payments, supplier payments and outstanding
          balances together in one financial workspace.
        </p>
      </div>
    </div>
  </section>
</div>


);
}
