interface AdminActivitySummaryProps {
  summary: {
    eventsToday: number;
    successful: number;
    warnings: number;
    errors: number;
    critical: number;
  };
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminActivitySummary({
  summary,
}: AdminActivitySummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Metric
        label="Events Today"
        value={summary.eventsToday}
      />

      <Metric
        label="Successful"
        value={summary.successful}
      />

      <Metric
        label="Warnings"
        value={summary.warnings}
      />

      <Metric
        label="Errors"
        value={summary.errors}
      />

      <Metric
        label="Critical"
        value={summary.critical}
      />
    </section>
  );
}