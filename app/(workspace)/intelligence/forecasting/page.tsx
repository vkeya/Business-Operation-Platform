import Link from "next/link";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";

import {
  requireBusinessPermission,
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";

import {
  forecastingIntelligenceService,
} from "@/lib/intelligence/forecastingIntelligenceService";

export default async function ForecastingIntelligencePage() {
  const context =
    await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    "sales.read",
  );

  let intelligence;

  try {
    intelligence =
      await forecastingIntelligenceService
        .getForecastingIntelligence(
          context.business.id,
        );
  } catch (error) {
    if (
      error instanceof
      BusinessPermissionError
    ) {
      throw error;
    }

    throw error;
  }

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Dashboard
        </Link>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Professional Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Forecasting
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Directional forecasts from completed sales history.
            Forecasts are separated by currency and should be used
            as planning signals rather than guarantees.
          </p>
        </div>
      </div>

      {intelligence.series.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Not enough data yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Forecasting will appear after completed sales provide
            enough historical observations.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {intelligence.series.map(
              (item) => (
                <div
                  key={item.currency}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.currency}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {item.projectedRevenue.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        projected revenue for next{" "}
                        {intelligence.horizonDays} days
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.confidence}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Historical average/day
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.averageDailyRevenue.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Forecast average/day
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.forecastDailyRevenue.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Projected sales
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.projectedSales.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 1,
                          },
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Trend
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.trend}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Daily forecast
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Next {intelligence.horizonDays} days, kept separate by currency.
                </p>
              </div>

              <p className="text-xs text-slate-400">
                Generated{" "}
                {new Date(
                  intelligence.generatedAt,
                ).toLocaleString()}
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {intelligence.series.map(
                (item) => (
                  <div
                    key={item.currency}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.currency}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {item.dailyForecast.map(
                        (day) => (
                          <div
                            key={`${item.currency}-${day.date}`}
                            className="grid grid-cols-3 gap-4 px-4 py-3 text-sm"
                          >
                            <span className="text-slate-500">
                              {day.date}
                            </span>
                            <span className="font-medium text-slate-900">
                              {day.revenue.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </span>
                            <span className="text-right text-slate-500">
                              {day.sales.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 1,
                                },
                              )}{" "}
                              sales
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Methodology
        </h2>

        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">
              Baseline
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {intelligence.methodology.baseline}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-slate-500">
              Model
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {intelligence.methodology.model}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-slate-500">
              Currency handling
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {intelligence.methodology.currencyHandling}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-slate-500">
              Data requirement
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {intelligence.methodology.minimumDataRequirement}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          {intelligence.methodology.limitation}
        </p>
      </section>
    </main>
  );
}
