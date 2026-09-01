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

export default function RegisterPage() {
const router = useRouter();

const searchParams =
useSearchParams();

const invitation =
searchParams.get("invitation");

const [name, setName] =
useState("");

const [email, setEmail] =
useState("");

const [password, setPassword] =
useState("");

const [error, setError] =
useState("");

const [submitting, setSubmitting] =
useState(false);

async function handleSubmit(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();


setError("");
setSubmitting(true);

try {
  const response =
    await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

  const data =
    await response.json();

  if (!response.ok) {
    setError(
      data?.error ??
        "Unable to create account.",
    );
    return;
  }

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
      "Account created, but automatic sign in failed. Please sign in.",
    );

    const loginUrl =
      invitation
        ? `/login?invitation=${encodeURIComponent(
            invitation,
          )}`
        : "/login";

    router.push(loginUrl);

    return;
  }

  const destination =
invitation
? `/auth/continue?invitation=${encodeURIComponent(
        invitation,
      )}`
: "/auth/continue";

router.push(destination);
router.refresh();

} catch {
  setError(
    "Unable to create account. Please try again.",
  );
} finally {
  setSubmitting(false);
}


}

function handleSignIn() {
const loginUrl =
invitation
? `/login?invitation=${encodeURIComponent(
            invitation,
          )}`
: "/login";


router.push(loginUrl);


}

return ( <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"> <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"> <div> <h1 className="text-2xl font-semibold text-slate-900">
Create your account </h1>


      <p className="mt-2 text-sm text-slate-500">
        {invitation
          ? "Create your account to accept your business invitation."
          : "Create an account to start setting up your business workspace."}
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
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Full name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </div>

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
            setEmail(event.target.value)
          }
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
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
            setPassword(event.target.value)
          }
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
        />

        <p className="mt-2 text-xs text-slate-500">
          Must be at least 8 characters.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-slate-500">
      Already have an account?{" "}
      <button
        type="button"
        onClick={handleSignIn}
        className="font-medium text-slate-900 underline"
      >
        Sign in
      </button>
    </p>
  </div>
</main>


);
}
