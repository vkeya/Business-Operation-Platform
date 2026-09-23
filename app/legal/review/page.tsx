"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const documents = [
  {
    key: "termsAccepted",
    label: "Terms of Service",
    href: "/legal/terms",
    required: true,
  },
  {
    key: "privacyAccepted",
    label: "Privacy Policy",
    href: "/legal/privacy",
    required: true,
  },
  {
    key: "acceptableUseAccepted",
    label: "Acceptable Use Policy",
    href: "/legal/acceptable-use",
    required: true,
  },
] as const;

export default function LegalReviewPage() {
  const router = useRouter();

  const [accepted, setAccepted] =
    useState<Record<string, boolean>>({
      termsAccepted: false,
      privacyAccepted: false,
      acceptableUseAccepted: false,
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const allAccepted = documents.every(
    (document) => accepted[document.key],
  );

  function toggle(
    key: keyof typeof accepted,
  ) {
    setAccepted((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!allAccepted) {
      setError(
        "Please accept all required legal documents.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/legal/reaccept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(accepted),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Unable to update your legal acceptance.",
        );
      }

      router.replace("/auth/continue");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your legal acceptance.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
              Legal review
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Review updated legal documents
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              SmatPic&apos;s legal documents have been updated. Please review
              the applicable documents and confirm your acceptance before
              continuing to use the platform.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="space-y-4">
          {documents.map((document) => (
            <label
              key={document.key}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
            >
              <input
                type="checkbox"
                checked={accepted[document.key] ?? false}
                onChange={() => toggle(document.key)}
                disabled={submitting}
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm leading-6 text-slate-700">
                I have reviewed and accept the{" "}
                <Link
                  href={document.href}
                  target="_blank"
                  className="font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-900"
                >
                  {document.label}
                </Link>
                .
              </span>
            </label>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!allAccepted || submitting}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Accept and continue"}
        </button>
      </form>
    </div>
  );
}