"use client";

import {
  FormEvent,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const invitation =
    searchParams.get("invitation");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  function getDestination() {
    return invitation
      ? `/invitations/${encodeURIComponent(
          invitation,
        )}`
      : "/auth/continue";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const result = await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
        },
      );

      if (!result?.ok) {
        setError(
          "Invalid email or password.",
        );
        return;
      }

      router.push(
        getDestination(),
      );

      router.refresh();
    } catch {
      setError(
        "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setSubmitting(true);

    try {
      await signIn("google", {
        callbackUrl:
          getDestination(),
      });
    } catch {
      setError(
        "Unable to sign in with Google. Please try again.",
      );

      setSubmitting(false);
    }
  }

  function handleRegister() {
    const registerUrl =
      invitation
        ? `/register?invitation=${encodeURIComponent(
            invitation,
          )}`
        : "/register";

    router.push(registerUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {invitation
              ? "Sign in to accept your business invitation."
              : "Sign in to access your business workspace."}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
              autoComplete="email"
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              required
              autoComplete="current-password"
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-xs text-slate-400">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}

          <button
            type="button"
            onClick={handleRegister}
            disabled={submitting}
            className="font-medium text-slate-900 underline disabled:opacity-60"
          >
            Create account
          </button>
        </p>
      </div>
    </main>
  );
}