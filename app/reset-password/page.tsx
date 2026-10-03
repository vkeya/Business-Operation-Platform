"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PageState =
  | "ready"
  | "submitting"
  | "success"
  | "error";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] =
    useState<PageState>("ready");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setState("error");
        setMessage(
          "This password reset link is incomplete or invalid.",
        );
      });
    }
  }, [token]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setState("error");
      setMessage(
        "This password reset link is incomplete or invalid.",
      );
      return;
    }

    if (password.length < 8) {
      setState("error");
      setMessage(
        "Your password must be at least 8 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setState("error");
      setMessage(
        "The passwords do not match.",
      );
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(
          data?.error ||
            "We couldn't reset your password. Please request a new reset link.",
        );
        return;
      }

      setState("success");
      setPassword("");
      setConfirmPassword("");

      setMessage(
        "Your password has been changed successfully. Your SmatPic account is now secure.",
      );
    } catch {
      setState("error");
      setMessage(
        "We couldn't complete the password reset. Please try again.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] lg:grid lg:grid-cols-2">

      {/* =====================================================
          LEFT — SMATPIC BRAND PANEL
      ===================================================== */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#020817] px-10 py-10 text-white lg:flex lg:flex-col">

        {/* Background glow */}
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#08b6d9]/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#f97316]/10 blur-3xl" />

        {/* Decorative rings */}
        <div className="pointer-events-none absolute left-[38%] top-[45%] h-64 w-64 rounded-full border border-white/5" />

        <div className="pointer-events-none absolute left-[41%] top-[48%] h-48 w-48 rounded-full border border-white/5" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#08b6d9] via-[#1683d8] to-[#f97316] shadow-lg shadow-cyan-500/10">
            <span className="text-lg font-bold text-white">
              S
            </span>
          </div>

          <div>
            <div className="text-base font-semibold tracking-tight">
              SmatPic
            </div>

            <div className="text-xs text-slate-400">
              Business Operations Platform
            </div>
          </div>
        </div>

        {/* Main message */}
        <div className="relative z-10 mt-auto max-w-xl pb-16">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Secure account recovery
          </div>

          <h1 className="max-w-2xl text-5xl font-medium leading-[1.08] tracking-tight">
            Get back to running
            <br />
            <span className="bg-gradient-to-r from-white via-cyan-100 to-orange-300 bg-clip-text text-transparent">
              your business.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
            Create a new secure password and continue managing
            your customers, inventory, sales, purchases and
            business operations from one connected workspace.
          </p>

          {/* Security cards */}
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-cyan-300"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="10"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                  <circle
                    cx="12"
                    cy="15"
                    r="1"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium">
                Secure access
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your password is protected and securely stored.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/10 bg-orange-400/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-orange-300"
                >
                  <path d="M12 3l8 4v5c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V7l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>

              <p className="text-sm font-medium">
                Account protected
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your new password takes effect immediately.
              </p>
            </div>

          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} SmatPic
        </div>
      </section>

      {/* =====================================================
          RIGHT — RESET PASSWORD
      ===================================================== */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#08b6d9] via-[#1683d8] to-[#f97316]">
              <span className="font-bold text-white">
                S
              </span>
            </div>

            <div>
              <div className="font-semibold text-slate-950">
                SmatPic
              </div>

              <div className="text-xs text-slate-500">
                Business Operations Platform
              </div>
            </div>
          </div>

          {/* Card */}
          <div>

            {state === "success" ? (
              <>
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-medium tracking-tight text-slate-950">
                    Password updated
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {message}
                  </p>
                </div>

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-xl bg-[#111c32] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17243d]"
                >
                  Continue to sign in
                  <span className="ml-2">
                    →
                  </span>
                </Link>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 018 0v3" />
                    </svg>

                    Secure password reset
                  </div>

                  <h2 className="text-3xl font-medium tracking-tight text-slate-950">
                    Create a new password
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Choose a strong password to keep your
                    SmatPic account secure.
                  </p>
                </div>

                {/* Error */}
                {state === "error" && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {message}
                  </div>
                )}

                {/* Invalid token */}
                {!token ? (
                  <div>
                    <p className="text-sm leading-6 text-slate-600">
                      This reset link is missing or invalid.
                      Please request a new password reset link.
                    </p>

                    <Link
                      href="/forgot-password"
                      className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#111c32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17243d]"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* New password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        New password
                      </label>

                      <div className="relative">
                        <input
                          id="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value,
                            )
                          }
                          autoComplete="new-password"
                          minLength={8}
                          required
                          disabled={
                            state === "submitting"
                          }
                          placeholder="Enter a new password"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1683d8] focus:ring-4 focus:ring-[#1683d8]/10 disabled:bg-slate-50"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value,
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-900"
                        >
                          {showPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Use at least 8 characters.
                      </p>
                    </div>

                    {/* Confirm */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Confirm new password
                      </label>

                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                          }
                          autoComplete="new-password"
                          minLength={8}
                          required
                          disabled={
                            state === "submitting"
                          }
                          placeholder="Confirm your new password"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1683d8] focus:ring-4 focus:ring-[#1683d8]/10 disabled:bg-slate-50"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (value) => !value,
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-900"
                        >
                          {showConfirmPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Password guidance */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-600">
                        Password security
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Use a password that you do not use
                        elsewhere. Your new password will
                        replace your previous password.
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={
                        state === "submitting"
                      }
                      className="flex w-full items-center justify-center rounded-xl bg-[#111c32] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17243d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {state === "submitting"
                        ? "Updating password..."
                        : "Update password"}

                      {state !== "submitting" && (
                        <span className="ml-2">
                          →
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-7 border-t border-slate-200 pt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
                  >
                    ← Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure access to your SmatPic workspace
          </p>

        </div>
      </section>
    </main>
  );
}