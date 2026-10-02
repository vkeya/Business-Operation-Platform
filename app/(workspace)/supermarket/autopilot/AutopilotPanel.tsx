"use client";

import { useEffect, useState } from "react";

type Priority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

type ActionType =
  | "REPLENISH"
  | "PROTECT_STOCK"
  | "PROMOTE"
  | "CLEARANCE"
  | "PROTECT_MARGIN"
  | "REVIEW_PRICE"
  | "CROSS_SELL"
  | "MONITOR";

type AutopilotAction = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  priority: Priority;
  action: ActionType;
  title: string;
  reason: string;
  source: string;
  score: number;
  status?: ActionStatus;
  evidence: {
    stockCoverageDays: number | null;
    forecastStockoutDays: number | null;
    forecastDailyVelocity: number | null;
    demandTrend: string | null;
    pricingAction: string | null;
    pricingRisk: string | null;
    basketOpportunity: string | null;
    basketPartnerProductId: string | null;
    basketPartnerProductName: string | null;
  };
};

type ActionStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DISMISSED"
  | "SNOOZED";

type AutopilotSummary = {
  businessId: string;
  lookbackDays: number;
  generatedAt: string;
  totalActions: number;
  criticalActions: number;
  highPriorityActions: number;
  mediumPriorityActions: number;
  lowPriorityActions: number;
  replenishmentActions: number;
  promotionActions: number;
  pricingActions: number;
  crossSellActions: number;
  monitoringActions: number;
  actions: AutopilotAction[];
};

function priorityClasses(
  priority: Priority,
) {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-50 text-red-700 ring-red-200";

    case "HIGH":
      return "bg-orange-50 text-orange-700 ring-orange-200";

    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

function priorityLabel(
  priority: Priority,
) {
  return priority.charAt(0) +
    priority.slice(1).toLowerCase();
}

function actionLabel(
  action: ActionType,
) {
  switch (action) {
    case "REPLENISH":
      return "Replenishment";

    case "PROTECT_STOCK":
      return "Stock";

    case "PROMOTE":
      return "Promotion";

    case "CLEARANCE":
      return "Clearance";

    case "PROTECT_MARGIN":
      return "Margin";

    case "REVIEW_PRICE":
      return "Pricing";

    case "CROSS_SELL":
      return "Cross-sell";

    case "MONITOR":
      return "Demand";

    default:
      return "Intelligence";
  }
}

function formatDays(
  value: number | null,
) {
  if (value === null) {
    return "—";
  }

  if (value < 1) {
    return "<1 day";
  }

  return `${Math.round(value)} days`;
}

export default function AutopilotPanel() {
  const [data, setData] =
    useState<AutopilotSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processingActionId, setProcessingActionId] =
  useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);


  async function updateAction(
  actionId: string,
  status:
    | "ACCEPTED"
    | "DISMISSED"
    | "SNOOZED"
    | "COMPLETED",
) {
  try {
    setProcessingActionId(actionId);
    setError(null);

    const response = await fetch(
      `/api/supermarket/autopilot/actions/${actionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      },
    );

    if (!response.ok) {
      const payload =
        await response.json().catch(() => null);

      throw new Error(
        payload?.error ??
          "Unable to update autopilot action.",
      );
    }

    await load();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to update autopilot action.",
    );
  } finally {
    setProcessingActionId(null);
  }
}

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const response =
        await fetch(
          "/api/supermarket/autopilot",
          {
            cache: "no-store",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load Autopilot intelligence.",
        );
      }

      const payload =
        await response.json();

      setData(payload.intelligence);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Autopilot intelligence.",
      );
    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-10 w-72 rounded bg-slate-100" />

          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-20 rounded-2xl bg-slate-50"
                />
              ),
            )}
          </div>

          <div className="h-32 rounded-2xl bg-slate-50" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500">
          Autopilot
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Intelligence unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const critical =
    data.actions.filter(
      (item) =>
        item.priority === "CRITICAL",
    );

  const high =
    data.actions.filter(
      (item) =>
        item.priority === "HIGH",
    );

  const other =
    data.actions.filter(
      (item) =>
        item.priority !== "CRITICAL" &&
        item.priority !== "HIGH",
    );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Supermarket intelligence
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Autopilot
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              The most important actions across stock,
              demand, forecasting, pricing and customer
              buying patterns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:self-auto"
          >
            Refresh
          </button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Critical"
            value={data.criticalActions}
            tone="critical"
          />

          <SummaryCard
            label="High priority"
            value={data.highPriorityActions}
            tone="high"
          />

          <SummaryCard
            label="Medium"
            value={data.mediumPriorityActions}
            tone="medium"
          />

          <SummaryCard
            label="Total actions"
            value={data.totalActions}
            tone="neutral"
          />
        </div>
      </div>

      {data.totalActions === 0 ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            All clear
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Nothing needs your attention right now.
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Autopilot is not seeing a significant stock,
            demand, pricing or basket opportunity.
          </p>
        </div>
      ) : (
        <>
          {critical.length > 0 && (
            <ActionGroup
              title="Needs attention"
              subtitle="Resolve these first."
              actions={critical}
              processingActionId={processingActionId}
              onUpdate={updateAction}
            />
          )}

          {high.length > 0 && (
            <ActionGroup
              title="High priority"
              subtitle="Important actions worth reviewing."
              actions={high}
              processingActionId={processingActionId}
              onUpdate={updateAction}
            />
          )}

          {other.length > 0 && (
            <ActionGroup
              title="Opportunities"
              subtitle="Potential improvements identified by Autopilot."
              actions={other}
              processingActionId={processingActionId}
              onUpdate={updateAction}
            />
          )}
        </>
      )}

      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          Based on the last {data.lookbackDays} days
        </span>

        <span>
          Updated{" "}
          {new Date(
            data.generatedAt,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone:
    | "critical"
    | "high"
    | "medium"
    | "neutral";
}) {
  const toneClasses = {
    critical:
      "bg-red-50 text-red-700",
    high:
      "bg-orange-50 text-orange-700",
    medium:
      "bg-amber-50 text-amber-700",
    neutral:
      "bg-slate-50 text-slate-700",
  };

  return (
    <div
      className={`rounded-2xl p-4 ${toneClasses[tone]}`}
    >
      <p className="text-xs font-medium">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function ActionGroup({
  title,
  subtitle,
  actions,
  processingActionId,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  actions: AutopilotAction[];
  processingActionId: string | null;
  onUpdate: (
    actionId: string,
    status: Exclude<ActionStatus, "PENDING">,
  ) => void;
}) {
  return (
    <section>
      <div className="mb-3 px-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((item) => (
          <AutopilotActionCard
            key={item.id}
            action={item}
            processing={
              processingActionId === item.id
            }
            onUpdate={(status) =>
              void onUpdate(item.id, status)
            }
          />
        ))}
      </div>
    </section>
  );
}

function AutopilotActionCard({
  action,
  processing,
  onUpdate,
}: {
  action: AutopilotAction;
  processing: boolean;
  onUpdate: (
    status: Exclude<ActionStatus, "PENDING">,
  ) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${priorityClasses(
                action.priority,
              )}`}
            >
              {priorityLabel(
                action.priority,
              )}
            </span>

            <span className="text-xs text-slate-400">
              {actionLabel(
                action.action,
              )}
            </span>
          </div>

          <h3 className="mt-3 text-base font-semibold text-slate-950">
            {action.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {action.reason}
          </p>

          {action.evidence
            .basketPartnerProductName && (
            <p className="mt-3 text-xs text-slate-500">
              Partner product:{" "}
              <span className="font-medium text-slate-700">
                {
                  action.evidence
                    .basketPartnerProductName
                }
              </span>
            </p>
          )}
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs text-slate-400">
            Confidence score
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-900">
            {Math.round(
              action.score,
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
        <Evidence
          label="Stock coverage"
          value={formatDays(
            action.evidence
              .stockCoverageDays,
          )}
        />

        <Evidence
          label="Forecast stockout"
          value={formatDays(
            action.evidence
              .forecastStockoutDays,
          )}
        />

        <Evidence
          label="Demand"
          value={
            action.evidence
              .demandTrend
              ?.replace(
                "_",
                " ",
              ) ?? "—"
          }
        />
      </div>

	  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
  <button
    type="button"
    disabled={processing}
    onClick={() => onUpdate("ACCEPTED")}
    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {processing
      ? "Updating..."
      : "Accept"}
  </button>

  <button
    type="button"
    disabled={processing}
    onClick={() => onUpdate("SNOOZED")}
    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Snooze
  </button>

  <button
    type="button"
    disabled={processing}
    onClick={() => onUpdate("DISMISSED")}
    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Dismiss
  </button>

  {action.status &&
    action.status !== "PENDING" && (
      <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {action.status.toLowerCase()}
      </span>
    )}
</div>

    </article>
  );
}

function Evidence({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}
