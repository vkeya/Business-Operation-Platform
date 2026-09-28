"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  const [message, setMessage] =
    useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Invalid verification link.");
      return;
    }

    async function verify() {
  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    );

        const data = await response.json();

        if (!response.ok) {
          setState("error");
          setMessage(
            data?.error ||
              "Unable to verify your email address.",
          );
          return;
        }

        setState("success");
        setMessage(
          "Your email address has been verified successfully.",
        );
      } catch {
        setState("error");
        setMessage(
          "Unable to verify your email address. Please try again.",
        );
      }
    }

    verify();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {state === "verifying" && (
          <>
            <div className="mb-6 text-3xl">...</div>
            <h1 className="text-2xl font-semibold">
              Verifying your email
            </h1>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mb-6 text-4xl">✓</div>

            <h1 className="text-2xl font-semibold">
              Email verified
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-md px-5 py-2.5 text-sm font-medium"
            >
              Continue to login
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mb-6 text-4xl">!</div>

            <h1 className="text-2xl font-semibold">
              Verification failed
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-md px-5 py-2.5 text-sm font-medium"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}