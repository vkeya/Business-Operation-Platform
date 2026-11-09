import {
  hasEntitlement,
} from "@/lib/subscription/subscriptionEntitlementService";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface BusinessPulseCardProps {
  businessId: string;
  revenue: number;
  profit: number;
  cashPosition: number;
  receivables: number;
  payables: number;
  inventoryValue: number;
  salesCount: number;
  lowStockItems: number;
  currency: string;
}

export default async function BusinessPulseCard({
  businessId,
  revenue,
  profit,
  cashPosition,
  receivables,
  payables,
  inventoryValue,
  salesCount,
  lowStockItems,
  currency,
}: BusinessPulseCardProps) {
  const enabled = await hasEntitlement(
    businessId,
    "BUSINESS_PULSE",
  );

  if (!enabled) {
    return (
      <section className="rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-7 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              SmatPic Intelligence
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Business Pulse
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Get a consolidated view of revenue, profitability, cash,
              receivables, payables, inventory and operating activity.
            </p>
            <Link
              href="/settings/subscription"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Upgrade to Professional
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const financialStatus =
    profit < 0
      ? "ATTENTION"
      : cashPosition < payables
        ? "WATCH"
        : "HEALTHY";

  const statusClass =
    financialStatus === "ATTENTION"
      ? "border-red-200 bg-red-50"
      : financialStatus === "WATCH"
        ? "border-amber-200 bg-amber-50"
        : "border-emerald-200 bg-emerald-50";

  const money = (value: number) =>
    `${currency} ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section
      className={`rounded-[32px] border p-7 shadow-sm sm:p-8 ${statusClass}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            SmatPic Intelligence
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            Business Pulse
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            A consolidated view of the business signals already available
            in your dashboard.
          </p>
        </div>
        <span className="w-fit rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
          {financialStatus}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Revenue", money(revenue)],
          ["Profit", money(profit)],
          ["Cash Position", money(cashPosition)],
          ["Inventory", money(inventoryValue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Receivables", money(receivables)],
          ["Payables", money(payables)],
          [
            "Sales Activity",
            `${salesCount} completed sale${salesCount === 1 ? "" : "s"}`,
          ],
          [
            "Inventory Attention",
            `${lowStockItems} low-stock item${lowStockItems === 1 ? "" : "s"}`,
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
