"use client";

interface ActivityEvent {
  id: string;
  createdAt: Date | string;
  actorId: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
  action: string;
  category: string;
  severity: string;
  outcome: string;
  entityType: string;
  entityId: string | null;

  beforeData: unknown;
  afterData: unknown;

  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  correlationId: string | null;

  metadata: unknown;
}

interface ActivityDetailDrawerProps {
  event: ActivityEvent | null;
  onClose: () => void;
}

function formatAction(action: string) {
  return action
    .replace(/\./g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "medium",
    },
  ).format(new Date(date));
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  try {
    return JSON.stringify(
      value,
      null,
      2,
    );
  } catch {
    return String(value);
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4 border-b py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-sm">
        {value || "—"}
      </dd>
    </div>
  );
}

function JsonSection({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  const formatted = formatJson(value);

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">
        {title}
      </h3>

      <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">
        {formatted}
      </pre>
    </section>
  );
}

export default function ActivityDetailDrawer({
  event,
  onClose,
}: ActivityDetailDrawerProps) {
  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close activity details"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col border-l bg-background shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              Activity Details
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold">
              {formatAction(event.action)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <dl>
              <DetailRow
                label="Time"
                value={formatDate(
                  event.createdAt,
                )}
              />

              <div className="grid grid-cols-[130px_1fr] gap-4 border-b py-3">
  <dt className="text-sm text-muted-foreground">
    Actor
  </dt>

  <dd className="min-w-0">
    {event.actor ? (
      <>
        <p className="text-sm font-medium">
          {event.actor.name}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {event.actor.email}
        </p>

        <p className="mt-0.5 break-all text-xs text-muted-foreground">
          {event.actor.id}
        </p>
      </>
    ) : (
      <span className="text-sm text-muted-foreground">
        System
      </span>
    )}
  </dd>
</div>

              <DetailRow
                label="Action"
                value={event.action}
              />

              <DetailRow
                label="Category"
                value={event.category}
              />

              <DetailRow
                label="Severity"
                value={event.severity}
              />

              <DetailRow
                label="Outcome"
                value={event.outcome}
              />

              <DetailRow
                label="Entity"
                value={event.entityType}
              />

              <DetailRow
                label="Entity ID"
                value={
                  event.entityId ?? "—"
                }
              />
            </dl>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              Request Context
            </h3>

            <dl className="rounded-lg border px-3">
              <DetailRow
                label="IP Address"
                value={
                  event.ipAddress ??
                  "—"
                }
              />

              <DetailRow
                label="Request ID"
                value={
                  event.requestId ??
                  "—"
                }
              />

              <DetailRow
                label="Correlation ID"
                value={
                  event.correlationId ??
                  "—"
                }
              />

              <DetailRow
                label="User Agent"
                value={
                  event.userAgent ??
                  "—"
                }
              />
            </dl>
          </section>

          <JsonSection
            title="Before"
            value={event.beforeData}
          />

          <JsonSection
            title="After"
            value={event.afterData}
          />

          <JsonSection
            title="Metadata"
            value={event.metadata}
          />
        </div>
      </aside>
    </div>
  );
}