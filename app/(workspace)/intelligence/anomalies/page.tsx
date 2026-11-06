import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import { getAnomalyDetection } from "@/lib/intelligence/anomalyDetectionService";

function formatValue(
  value: number,
  metric: string,
  dimension: string | null,
) {
  if (metric === "Discount rate") {
    return `${value.toFixed(2)}%`;
  }

  if (
    metric === "Completed sales count" ||
    metric === "Inventory adjustment quantity" ||
    metric === "Failed payment attempts"
  ) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  if (dimension) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: dimension,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default async function AnomalyDetectionPage() {
  const context = await getCurrentBusinessContext();
  const intelligence = await getAnomalyDetection(
    context.business.id,
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Anomaly Detection
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Professional statistical signals for unusual
          changes in business activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Anomalies detected"
          value={intelligence.summary.totalAnomalies.toLocaleString()}
        />
        <MetricCard
          label="High severity"
          value={intelligence.summary.high.toLocaleString()}
        />
        <MetricCard
          label="Medium severity"
          value={intelligence.summary.medium.toLocaleString()}
        />
        <MetricCard
          label="Low severity"
          value={intelligence.summary.low.toLocaleString()}
        />
      </div>

      <section className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3">Severity</th>
              <th className="p-3">Date</th>
              <th className="p-3">Signal</th>
              <th className="p-3">Dimension</th>
              <th className="p-3">Observed</th>
              <th className="p-3">Baseline</th>
              <th className="p-3">Z-score</th>
              <th className="p-3">Direction</th>
            </tr>
          </thead>
          <tbody>
            {intelligence.anomalies.map(
              (anomaly, index) => (
                <tr
                  key={`${anomaly.date}:${anomaly.metric}:${anomaly.dimension ?? "business"}:${index}`}
                  className="border-b last:border-0"
                >
                  <td className="p-3 font-medium">
                    {anomaly.severity}
                  </td>
                  <td className="p-3">
                    {anomaly.date}
                  </td>
                  <td className="p-3">
                    {anomaly.metric}
                  </td>
                  <td className="p-3">
                    {anomaly.dimension ?? "Business"}
                  </td>
                  <td className="p-3">
                    {formatValue(
                      anomaly.value,
                      anomaly.metric,
                      anomaly.dimension,
                    )}
                  </td>
                  <td className="p-3">
                    {formatValue(
                      anomaly.baselineMean,
                      anomaly.metric,
                      anomaly.dimension,
                    )}
                  </td>
                  <td className="p-3">
                    {Number.isFinite(anomaly.zScore)
                      ? anomaly.zScore.toFixed(2)
                      : "∞"}
                  </td>
                  <td className="p-3">
                    {anomaly.direction}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {intelligence.anomalies.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            No statistically significant anomalies were
            detected in the current period.
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-muted/20 p-4">
        <h2 className="font-semibold">
          Interpretation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An anomaly is a statistical signal that something
          is unusual relative to the preceding 30-day
          baseline. It is not proof of fraud, an error or
          misconduct and should be investigated in context.
        </p>

        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Detection threshold: 2.5 standard deviations.
          </li>
          <li>
            Medium severity: 3 standard deviations.
          </li>
          <li>
            High severity: 4 standard deviations.
          </li>
          <li>
            Revenue is always analysed separately by
            currency.
          </li>
        </ul>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}
