import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
} from "lucide-react";

import { getMpesaConfigurationAction } from "@/lib/payment/mpesaActions";
import MpesaConfigForm from "./MpesaConfigForm";

export const dynamic = "force-dynamic";

export default async function MpesaSettingsPage() {
  const configuration = await getMpesaConfigurationAction();

  const safeConfiguration = configuration
    ? {
        merchantType: configuration.merchantType,
        shortcode: configuration.shortcode,
        consumerKey: configuration.consumerKey,
        environment: configuration.environment,
        isActive: configuration.isActive,
        verifiedAt: configuration.verifiedAt
          ? configuration.verifiedAt.toISOString()
          : null,
      }
    : null;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/settings/payments"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to payments
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Payments
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  M-Pesa
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                M-Pesa configuration
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Connect your business M-Pesa Till or PayBill to receive
                customer payments directly into your merchant account.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Smartphone className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      <MpesaConfigForm configuration={safeConfiguration} />
    </div>
  );
}