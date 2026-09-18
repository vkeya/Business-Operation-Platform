import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function PaymentsSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Payments
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Merchant configuration
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Payment methods
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Configure the payment channels your business uses to
                collect customer payments.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Payment channels
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Connect your payment providers
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Configure how customers can pay your business through SmatPic.
          </p>
        </div>

        <div className="grid gap-4">
          {/* M-Pesa */}
          <Link
            href="/settings/payments/mpesa"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                  <Smartphone className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      M-Pesa
                    </h3>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Not configured
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Connect your business M-Pesa Till or PayBill so
                    customers can receive an STK Push at checkout.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-violet-700">
                Configure
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* Future card payments */}
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400">
                <CreditCard className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Card payments
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Card terminal and online card payment integration will
                  be configured here.
                </p>

                <span className="mt-3 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}