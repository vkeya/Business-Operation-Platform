"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type RequestType =
  | "ACCESS"
  | "CORRECTION"
  | "DELETION"
  | "EXPORT"
  | "RESTRICTION"
  | "OBJECTION";

type RequestStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

interface PrivacyRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  requestedAt: string;
  completedAt?: string | null;
}

const requestOptions: Array<{
  type: RequestType;
  title: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    type: "ACCESS",
    title: "Access my data",
    description:
      "Request access to the personal information SmatPic holds about you.",
    icon: UserRound,
  },
  {
    type: "CORRECTION",
    title: "Correct my data",
    description:
      "Request correction of inaccurate or incomplete personal information.",
    icon: CheckCircle2,
  },
  {
    type: "EXPORT",
    title: "Export my data",
    description:
      "Request a copy of your personal information in a usable format.",
    icon: Download,
  },
  {
    type: "DELETION",
    title: "Delete my data",
    description:
      "Request deletion of your personal information where legally applicable.",
    icon: Lock,
  },
  {
    type: "RESTRICTION",
    title: "Restrict processing",
    description:
      "Request restriction of applicable processing of your personal information.",
    icon: ShieldCheck,
  },
  {
    type: "OBJECTION",
    title: "Object to processing",
    description:
      "Submit an objection to applicable processing of your personal information.",
    icon: FileText,
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: RequestStatus) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function requestTitle(type: RequestType) {
  return (
    requestOptions.find((option) => option.type === type)?.title ??
    type
  );
}

export default function PrivacyPage() {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<RequestType | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadRequests() {
    try {
      setError("");

      const response = await fetch("/api/privacy/requests", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to load privacy requests.",
        );
      }

      setRequests(data.requests ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load privacy requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function submitRequest(type: RequestType) {
    try {
      setSubmitting(type);
      setError("");
      setSuccess("");

      const response = await fetch("/api/privacy/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to submit privacy request.",
        );
      }

      setSuccess("Your privacy request has been submitted.");

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit privacy request.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  async function cancelRequest(requestId: string) {
    try {
      setCancelling(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/privacy/requests/${requestId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to cancel request.",
        );
      }

      setSuccess("Your privacy request has been cancelled.");

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel request.",
      );
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Privacy & Data
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Account privacy
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Privacy Center
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Manage your personal information, privacy rights,
                and requests relating to data held by SmatPic.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Privacy rights */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Privacy controls
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Manage your personal data
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Submit a request concerning your personal information.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {requestOptions.map((item) => {
            const Icon = item.icon;
            const isSubmitting = submitting === item.type;

            return (
              <div
                key={item.type}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-violet-700" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <button
                  type="button"
                  onClick={() => submitRequest(item.type)}
                  disabled={submitting !== null}
                  className="mt-5 text-sm font-semibold text-violet-700 transition hover:text-violet-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit request →"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Request history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Request history
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Your privacy requests
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Track requests submitted through the SmatPic Privacy Center.
          </p>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
            You have not submitted any privacy requests.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {requestTitle(request.type)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Submitted {formatDate(request.requestedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {statusLabel(request.status)}
                  </span>

                  {request.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => cancelRequest(request.id)}
                      disabled={cancelling === request.id}
                      className="text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900 disabled:opacity-50"
                    >
                      {cancelling === request.id
                        ? "Cancelling..."
                        : "Cancel request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Legal documents */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Privacy information
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Legal & privacy documents
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review the policies governing your use of SmatPic and
            the processing of personal information.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Privacy Policy",
              description:
                "How SmatPic collects, uses, and protects personal data.",
              href: "/legal/privacy",
            },
            {
              title: "Cookie Policy",
              description:
                "Information about cookies and similar technologies.",
              href: "/legal/cookies",
            },
            {
              title: "Data Processing Agreement",
              description:
                "Terms governing processing of customer personal data.",
              href: "/legal/dpa",
            },
          ].map((document) => (
            <Link
              key={document.href}
              href={document.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                  <FileText className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-violet-700" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                {document.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {document.description}
              </p>

              <div className="mt-4 text-sm font-semibold text-violet-700">
                View document →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Privacy notice */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Privacy & security
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              Privacy requests are handled through the SmatPic compliance
              process
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Submitting a request does not automatically delete or modify
              your information. Requests are reviewed and processed in
              accordance with applicable requirements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}