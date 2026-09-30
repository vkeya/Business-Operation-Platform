interface RecentActivityProps {
  events: Array<{
    id: string;
    createdAt: Date;
    actorId: string | null;
    action: string;
    category: string;
    severity: string;
    outcome: string;
    entityType: string;
    entityId: string | null;
  }>;
}

function formatAction(action: string) {
  return action
    .replace(/\./g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(date));
}

export default function RecentActivity({
  events,
}: RecentActivityProps) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <h2 className="font-semibold">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          The latest activity recorded on the platform.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="divide-y">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {formatAction(event.action)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {event.category} ·{" "}
                  {event.entityType}
                  {event.entityId
                    ? ` · ${event.entityId}`
                    : ""}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">
                  {formatTime(event.createdAt)}
                </p>

                <p className="mt-1 text-xs">
                  {event.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}