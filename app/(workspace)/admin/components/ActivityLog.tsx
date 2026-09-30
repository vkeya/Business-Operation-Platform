"use client";

import { useEffect, useMemo, useState } from "react";
import ActivityDetailDrawer from "./ActivityDetailDrawer";

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

interface ActivityLogProps {
  initialEvents: ActivityEvent[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const CATEGORIES = [
  "AUTH",
  "USER",
  "BUSINESS",
  "INVENTORY",
  "SALES",
  "PURCHASES",
  "ACCOUNTING",
  "PAYMENTS",
  "ETIMS",
  "PHARMACY",
  "ADMIN",
  "SECURITY",
  "SYSTEM",
];

const SEVERITIES = [
  "INFO",
  "WARNING",
  "ERROR",
  "CRITICAL",
];

const OUTCOMES = [
  "SUCCESS",
  "FAILED",
  "DENIED",
];

function formatAction(action: string) {
  return action
    .replace(/\./g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function severityClass(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "font-semibold text-red-600";

    case "ERROR":
      return "font-medium text-red-500";

    case "WARNING":
      return "font-medium text-amber-600";

    default:
      return "text-muted-foreground";
  }
}

function outcomeClass(outcome: string) {
  switch (outcome) {
    case "SUCCESS":
      return "text-emerald-600";

    case "FAILED":
    case "DENIED":
      return "text-red-600";

    default:
      return "text-muted-foreground";
  }
}

export default function ActivityLog({
  initialEvents,
  pagination: initialPagination,
}: ActivityLogProps) {
  const [events, setEvents] =
    useState<ActivityEvent[]>(initialEvents);

  const [pagination, setPagination] =
    useState(initialPagination);

  const [page, setPage] = useState(
    initialPagination.page,
  );

  const [selectedEvent, setSelectedEvent] =
  useState<ActivityEvent | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [outcome, setOutcome] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const hasFilters = useMemo(
    () =>
      Boolean(
        search ||
          category ||
          severity ||
          outcome,
      ),
    [
      search,
      category,
      severity,
      outcome,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page),
        );

        params.set(
          "pageSize",
          String(initialPagination.pageSize),
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        if (category) {
          params.set(
            "category",
            category,
          );
        }

        if (severity) {
          params.set(
            "severity",
            severity,
          );
        }

        if (outcome) {
          params.set(
            "outcome",
            outcome,
          );
        }

        const response =
          await fetch(
            `/api/admin/activity?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "Unable to load activity.",
          );
        }

        setEvents(data.events);
setPagination(data.pagination);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load activity.",
        );
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    page,
    search,
    category,
    severity,
    outcome,
    initialPagination.pageSize,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setSeverity("");
    setOutcome("");
    setPage(1);
  }

  function changeFilter(
    setter: (
      value: string,
    ) => void,
    value: string,
  ) {
    setter(value);
    setPage(1);
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Activity Log
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete audit activity for this
                business.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {pagination.total.toLocaleString()}{" "}
              events
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row">
            <input
              value={search}
              onChange={(event) =>
                changeFilter(
                  setSearch,
                  event.target.value,
                )
              }
              placeholder="Search activity..."
              className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <select
              value={category}
              onChange={(event) =>
                changeFilter(
                  setCategory,
                  event.target.value,
                )
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                All categories
              </option>

              {CATEGORIES.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ),
              )}
            </select>

            <select
              value={severity}
              onChange={(event) =>
                changeFilter(
                  setSeverity,
                  event.target.value,
                )
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                All severities
              </option>

              {SEVERITIES.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ),
              )}
            </select>

            <select
              value={outcome}
              onChange={(event) =>
                changeFilter(
                  setOutcome,
                  event.target.value,
                )
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                All outcomes
              </option>

              {OUTCOMES.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ),
              )}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 rounded-md border px-3 text-sm hover:bg-muted"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="border-b bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {loading
            ? "Loading activity..."
            : "No audit events found."}
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-background/50 pt-8 text-sm text-muted-foreground">
              Loading...
            </div>
          )}

          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Time
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Actor
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Action
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Category
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Outcome
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Severity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {events.map(
                (event) => (
                  <tr
  key={event.id}
  onClick={() => setSelectedEvent(event)}
  className="cursor-pointer hover:bg-muted/30"
>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(
                        event.createdAt,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {event.actor ? (
  <div>
    <p className="font-medium">
      {event.actor.name}
    </p>

    <p className="text-xs text-muted-foreground">
      {event.actor.email}
    </p>
  </div>
) : (
  <span className="text-muted-foreground">
    System
  </span>
)}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {formatAction(
                        event.action,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {event.category}
                    </td>

                    <td
                      className={`px-4 py-3 ${outcomeClass(
                        event.outcome,
                      )}`}
                    >
                      {event.outcome}
                    </td>

                    <td
                      className={`px-4 py-3 ${severityClass(
                        event.severity,
                      )}`}
                    >
                      {event.severity}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground">
          Page {pagination.page} of{" "}
          {Math.max(
            pagination.totalPages,
            1,
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={
              !pagination.hasPreviousPage ||
              loading
            }
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
              )
            }
            className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              !pagination.hasNextPage ||
              loading
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1,
              )
            }
            className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

	  <ActivityDetailDrawer
  event={selectedEvent}
  onClose={() =>
    setSelectedEvent(null)
  }
/>

    </section>
  );
}