import Link from "next/link";
import SubscriptionCancellationControls from "@/components/subscription/SubscriptionCancellationControls";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  GitBranch,
  HardDrive,
  Package,
  ShieldCheck,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import SubscriptionPlanManager from "./SubscriptionPlanManager";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { getBusinessSubscription } from "@/lib/subscription/subscriptionEntitlementService";
import { getSubscriptionLimit } from "@/lib/subscription/subscriptionLimitService";
import { getSubscriptionUsage } from "@/lib/subscription/subscriptionUsageService";
import type { SubscriptionLimit } from "@/lib/subscription/subscriptionPlanCatalog";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "—";

  return value.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "TRIALING":
      return "Free trial";
    case "ACTIVE":
      return "Active";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Not configured";
  }
}

type CapacityMetric = {
  limit: SubscriptionLimit;
  label: string;
  icon: typeof Users;
};

const CAPACITY_METRICS: CapacityMetric[] = [
  { limit: "users", label: "Users", icon: Users },
  { limit: "branches", label: "Branches", icon: GitBranch },
  { limit: "warehouses", label: "Warehouses", icon: Warehouse },
  { limit: "products", label: "Products", icon: Package },
  {
    limit: "monthly_sales_transactions",
    label: "Monthly sales",
    icon: ShoppingCart,
  },
  {
    limit: "monthly_purchase_transactions",
    label: "Monthly purchases",
    icon: Database,
  },
];

async function getCapacityMetric(
  businessId: string,
  metric: CapacityMetric,
) {
  const resolution = await getSubscriptionLimit(
    businessId,
    metric.limit,
  );
  const usage = await getSubscriptionUsage(
    businessId,
    metric.limit,
  );

  return {
    ...metric,
    resolution,
    usage,
  };
}

function formatLimit(value: number | null) {
  return value === null ? "Unlimited" : value.toLocaleString();
}

function formatUsagePeriod(start?: Date, end?: Date) {
  if (!start || !end) return null;

  return `${start.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })} – ${new Date(end.getTime() - 1).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function CapacityCard({
  metric,
}: {
  metric: Awaited<ReturnType<typeof getCapacityMetric>>;
}) {
  const Icon = metric.icon;
  const { resolution, usage } = metric;
  const limit = resolution.effectiveLimit;
  const usagePercent =
    limit === null
      ? 0
      : Math.min(100, Math.round((usage.currentUsage / limit) * 100));
  const isNearLimit = limit !== null && usagePercent >= 80;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {metric.label}
            </p>
            <p className="text-[11px] text-slate-400">
              {resolution.addOnCapacity > 0
                ? `Includes +${resolution.addOnCapacity.toLocaleString()} add-on capacity`
                : "Plan capacity"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isNearLimit
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {resolution.isUnlimited ? "Unlimited" : `${usagePercent}% used`}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {usage.currentUsage.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            of {formatLimit(limit)}
          </p>
        </div>

        {metric.limit === "monthly_sales_transactions" ||
        metric.limit === "monthly_purchase_transactions" ? (
          <p className="text-right text-[10px] leading-4 text-slate-400">
            {formatUsagePeriod(usage.periodStart, usage.periodEnd)}
          </p>
        ) : null}
      </div>

      {!resolution.isUnlimited && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              isNearLimit ? "bg-amber-500" : "bg-violet-500"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default async function SubscriptionSettingsPage() {
  const context = await getCurrentBusinessContext();
  const subscription = await getBusinessSubscription(context.business.id);

  const now = new Date();
  const trialEndsAt = subscription?.trialEndsAt
    ? new Date(subscription.trialEndsAt)
    : null;

  const trialDaysRemaining =
    subscription?.status === "TRIALING" && trialEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (trialEndsAt.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null;

  const isTrialing =
    subscription?.status === "TRIALING" &&
    trialDaysRemaining !== null &&
    trialDaysRemaining > 0;

  const canReadUsage =
    subscription?.status === "ACTIVE" || isTrialing;

  const capacityMetrics = canReadUsage
    ? await Promise.all(
        CAPACITY_METRICS.map((metric) =>
          getCapacityMetric(context.business.id, metric),
        ),
      )
    : [];

  const storageLimit = canReadUsage
    ? await getSubscriptionLimit(context.business.id, "storage_gb")
    : null;

  const trialUrgency =
    trialDaysRemaining === null
      ? "normal"
      : trialDaysRemaining <= 1
        ? "urgent"
        : trialDaysRemaining <= 3
          ? "warning"
          : "normal";

  const statusClass =
    subscription?.status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : subscription?.status === "TRIALING"
        ? trialUrgency === "urgent"
          ? "bg-red-50 text-red-700"
          : trialUrgency === "warning"
            ? "bg-amber-50 text-amber-700"
            : "bg-violet-50 text-violet-700"
        : "bg-slate-100 text-slate-700";

  const statusLabel = getStatusLabel(subscription?.status);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-violet-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Subscription
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Workspace plan
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Subscription
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                View your current SmatPic plan, trial status, and subscription
                dates.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Current plan
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {subscription?.plan ?? "No plan"}
              </h2>
            </div>

            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass}`}
            >
              {subscription?.status === "ACTIVE" ||
              subscription?.status === "TRIALING" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}
              {statusLabel}
            </span>
          </div>

          {isTrialing && trialDaysRemaining !== null && (
            <div
              className={`mt-6 rounded-2xl border p-4 ${
                trialUrgency === "urgent"
                  ? "border-red-200 bg-red-50"
                  : trialUrgency === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-violet-200 bg-violet-50"
              }`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-900">
                  {trialDaysRemaining}{" "}
                  {trialDaysRemaining === 1 ? "day" : "days"} remaining
                </p>

                <p className="text-xs text-slate-600">
                  Trial ends {formatDate(trialEndsAt)}
                </p>
              </div>
            </div>
          )}

          {subscription?.status === "TRIALING" &&
            trialDaysRemaining === 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-800">
                  Your free trial has expired.
                </p>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  Choose a subscription plan to continue using business
                  operations.
                </p>
              </div>
            )}

          {subscription?.status === "EXPIRED" && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">
                Your subscription has expired.
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">
                Choose a subscription plan to restore business operations.
              </p>
            </div>
          )}

          {subscription?.status === "CANCELLED" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                Your subscription has been cancelled.
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Subscription recovery and plan selection will be available
                here when billing is enabled.
              </p>
            </div>
          )}

		  <SubscriptionCancellationControls
            status={subscription?.status}
            cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
            currentPeriodEnd={
              subscription?.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd)
                : null
            }
          />

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Billing
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            Plan management
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
           Choose a plan and continue securely with M-Pesa or card payment.
         </p>

         <SubscriptionPlanManager />
        </div>
      </section>

      {canReadUsage && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Capacity & usage
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Business limits
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Live usage against the capacity included with your current plan and active capacity add-ons.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <HardDrive className="h-4 w-4" />
                Storage allowance: {formatLimit(storageLimit?.effectiveLimit ?? null)} GB
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {capacityMetrics.map((metric) => (
              <CapacityCard key={metric.limit} metric={metric} />
            ))}
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs leading-5 text-slate-500">
              Storage usage is not shown because SmatPic does not yet have a canonical storage metering source. The allowance above is the configured plan capacity only.
            </p>
          </div>
        </section>
      )}

      {subscription?.status && !canReadUsage && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            Capacity usage is unavailable while the subscription is {statusLabel.toLowerCase()}.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Restore an active subscription to view current usage and capacity.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Subscription details
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Plan timeline
          </h2>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Trial started
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(
                subscription?.trialStartedAt
                  ? new Date(subscription.trialStartedAt)
                  : null,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Trial ends
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(trialEndsAt)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Subscription started
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(
                subscription?.startedAt
                  ? new Date(subscription.startedAt)
                  : null,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Subscription ended
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(
                subscription?.endedAt
                  ? new Date(subscription.endedAt)
                  : null,
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
