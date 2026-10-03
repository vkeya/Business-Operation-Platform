"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MailCheck,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type VerificationState =
  | "verifying"
  | "success"
  | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] =
    useState<VerificationState>("verifying");

  const [message, setMessage] = useState(
    "We're securely confirming your email address.",
  );

 useEffect(() => {
  if (!token) {
    queueMicrotask(() => {
      setState("error");
      setMessage(
        "This verification link is incomplete or invalid.",
      );
    });
return;
  }

  const verificationToken = token;

  async function verify() {
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(
          verificationToken,
        )}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(
          data?.error ||
            "We couldn't verify your email address.",
        );
        return;
      }

      setState("success");
      setMessage(
        "Your email address has been verified successfully. Your SmatPic account is now ready.",
      );
    } catch {
      setState("error");
      setMessage(
        "We couldn't complete the verification. Please try again or request a new verification email.",
      );
    }
  }

  void verify();
}, [token]);
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src="/smatpic-icon.png"
                  alt="SmatPic"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-base font-extrabold tracking-tight text-slate-950">
                  SmatPic
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Business Operations Platform
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Secure verification
              </span>
            </div>
          </div>
        </header>

        {/* Main */}
        <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-lg">
            {/* Status card */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
              {/* Card header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950 px-6 py-10 text-center sm:px-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
                />

                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl"
                />

                <div className="relative">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur">
                    {state === "success" ? (
                      <CheckCircle2 className="h-8 w-8 text-cyan-300" />
                    ) : state === "error" ? (
                      <TriangleAlert className="h-8 w-8 text-amber-300" />
                    ) : (
                      <MailCheck className="h-8 w-8 text-cyan-300" />
                    )}
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                      SmatPic Account Security
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {state === "success"
                      ? "Email verified"
                      : state === "error"
                        ? "Verification needs attention"
                        : "Verify your email"}
                  </h1>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
                    {state === "success"
                      ? "Your email address is confirmed and your SmatPic account is ready."
                      : state === "error"
                        ? "We couldn't complete this verification link."
                        : "We're securely confirming your email address."}
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                {state === "verifying" && (
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-950">
                      Confirming your email
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      {message}
                    </p>
                  </div>
                )}

                {state === "success" && (
                  <div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            You&apos;re all set
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {message}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <ShieldCheck className="h-4 w-4 text-slate-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Your account is protected
                          </p>

                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            Your verified email can be used for secure account access and important account notifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
                    >
                      Continue to SmatPic

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                )}

                {state === "error" && (
                  <div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                          <TriangleAlert className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Verification could not be completed
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {message}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex gap-3">
                        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Verification links expire
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            For security, verification links are valid for a limited period. If this link has expired or has already been used, request a new verification email.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className="mt-8 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back to sign in
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-7 text-center">
              <p className="text-xs text-slate-400">
                SmatPic · Business Operations Platform
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Secure business operations, connected in one workspace.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}