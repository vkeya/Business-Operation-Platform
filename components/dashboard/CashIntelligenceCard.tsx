import {
  hasEntitlement,
} from "@/lib/subscription/subscriptionEntitlementService";
import {
  getCashPositionInsight,
} from "@/lib/intelligence/cashPositionEngine";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface CashIntelligenceCardProps {
  businessId: string;
  cashPosition: number;
  receivables: number;
  payables: number;
  currency: string;
}

export default async function CashIntelligenceCard({
  businessId,
  cashPosition,
  receivables,
  payables,
  currency,
}: CashIntelligenceCardProps) {
  const enabled = await hasEntitlement(
    businessId,
    "CASH_INTELLIGENCE",
  );

  if (!enabled) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Cash Intelligence
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Get intelligent cash-position analysis and recommendations.
            </p>

            <Link
              href="/settings/subscription"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Upgrade to Professional
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const insight = getCashPositionInsight({
    cashPosition,
    receivables,
    payables,
  });

  const statusClass =
    insight.status === "CRITICAL"
      ? "border-red-200 bg-red-50"
      : insight.status === "WATCH"
        ? "border-amber-200 bg-amber-50"
        : "border-emerald-200 bg-emerald-50";

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${statusClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cash Intelligence
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {insight.title}
          </h2>
        </div>

        <span className="text-sm font-semibold text-slate-700">
          {currency} {cashPosition.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        {insight.message}
      </p>

      <div className="mt-4 rounded-xl bg-white/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommendation
        </p>

        <p className="mt-1 text-sm text-slate-700">
          {insight.recommendation}
        </p>
      </div>
    </section>
  );
}
