"use client";

import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordState =
  | "form"
  | "submitting"
  | "success"
  | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [state, setState] =
    useState<ForgotPasswordState>("form");

  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setState("error");
      setMessage("Please enter your email address.");
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(
          data?.error ||
            "We couldn't process your request. Please try again.",
        );
        return;
      }

      setState("success");
      setMessage(
        data?.message ||
          "If an account exists for this email address, password reset instructions have been sent.",
      );
    } catch {
      setState("error");
      setMessage(
        "We couldn't process your request. Please try again.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <span className="text-lg font-bold text-cyan-300">
                  S
                </span>
              </div>

              <div>
                <p className="text-base font-semibold">
                  SmatPic
                </p>

                <p className="text-xs text-slate-400">
                  Business Operations Platform
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              Account security
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight xl:text-5xl">
              Get back to your
              <span className="block text-slate-300">
                SmatPic workspace.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              We&apos;ll help you securely recover access to
              your account and get you back to managing
              your business.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Mail className="h-4 w-4 text-cyan-300" />
              </div>

              <span>
                Secure password recovery
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            SmatPic · Business Operations Platform
          </p>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-cyan-300">
                  S
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    SmatPic
                  </p>

                  <p className="text-xs text-slate-500">
                    Business Operations Platform
                  </p>
                </div>
              </div>
            </div>

            {state === "success" ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>

                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {message}
                </p>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  The password reset link will expire after
                  1 hour. If you don&apos;t see the email, check
                  your spam or junk folder.
                </p>

                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
                >
                  Back to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    Account recovery
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                    Forgot your password?
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Enter the email address associated with
                    your SmatPic account and we&apos;ll send you
                    a secure password reset link.
                  </p>
                </div>

                {state === "error" && message && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {message}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        required
                        autoComplete="email"
                        disabled={
                          state === "submitting"
                        }
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      state === "submitting"
                    }
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state === "submitting"
                      ? "Sending reset link..."
                      : "Send reset link"}

                    {state !== "submitting" && (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4"
                  >
                    Sign in
                  </Link>
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />

                    <p className="text-xs leading-5 text-slate-500">
                      For your security, we&apos;ll show the
                      same confirmation whether or not an
                      account exists for the email address.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}