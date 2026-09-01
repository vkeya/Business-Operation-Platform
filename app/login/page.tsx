"use client";

import {
ArrowRight,
Building2,
LockKeyhole,
Mail,
ShieldCheck,
Sparkles,
} from "lucide-react";
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

return ( <main className="min-h-screen bg-slate-50"> <div className="grid min-h-screen lg:grid-cols-2">
{/* Brand panel */} <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-base font-semibold tracking-tight text-white">
  Teketeke
</p>

<p className="mt-0.5 text-xs text-slate-400">
  Business Operations Platform
</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />

  Teketeke Business Platform
</div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight xl:text-5xl">
          Run your business
          <span className="block text-slate-300">
            from one workspace.
          </span>
        </h1>

        <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
          Manage customers, suppliers, inventory, sales,
          purchases, finances and business operations from
          one connected platform.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <FeatureItem
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            title="Secure access"
            description="Your workspace is protected."
          />

          <FeatureItem
            icon={
              <Sparkles className="h-4 w-4" />
            }
            title="Connected operations"
            description="Everything works together."
          />
        </div>
      </div>

      <p className="relative text-xs text-slate-500">
  Teketeke · Business Operations Platform
</p>
    </section>

    {/* Login panel */}
    <section className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Mobile brand */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
           <p className="text-base font-semibold tracking-tight text-slate-950">
  Teketeke
</p>

<p className="text-xs text-slate-500">
  Business Operations Platform
</p>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5" />

            Secure sign in
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {invitation
              ? "Sign in to accept your business invitation."
              : "Sign in to continue to your business workspace."}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Signing in..."
              : "Sign in to workspace"}

            {!submitting && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-[10px] font-bold tracking-[0.14em] text-slate-400">
            OR CONTINUE WITH
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />

          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}

          <button
            type="button"
            onClick={handleRegister}
            disabled={submitting}
            className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:text-violet-700 disabled:opacity-60"
          >
            Create account
          </button>
        </p>
      </div>
    </section>
  </div>
</main>


);
}

function FeatureItem({
icon,
title,
description,
}: {
icon: React.ReactNode;
title: string;
description: string;
}) {
return ( <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"> <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
{icon} </div>


  <p className="mt-4 text-sm font-semibold text-white">
    {title}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-400">
    {description}
  </p>
</div>


);
}

function GoogleIcon() {
return ( <svg
   viewBox="0 0 24 24"
   className="h-5 w-5"
   aria-hidden="true"
 > <path
     fill="#4285F4"
     d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.7 2.92-4.2 2.92-7.75Z"
   /> <path
     fill="#34A853"
     d="M12 21.7c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.58-1.99.92-3.29.92-2.53 0-4.67-1.71-5.44-4.01H3.32v2.88A9.72 9.72 0 0 0 12 21.7Z"
   /> <path
     fill="#FBBC05"
     d="M6.56 13.46A5.84 5.84 0 0 1 6.26 12c0-.51.1-1 .3-1.46V7.66H3.32A9.72 9.72 0 0 0 2.3 12c0 1.56.37 3.04 1.02 4.34l3.24-2.88Z"
   /> <path
     fill="#EA4335"
     d="M12 6.53c1.42 0 2.69.49 3.69 1.45l2.77-2.77C16.82 3.68 14.62 2.3 12 2.3a9.72 9.72 0 0 0-8.68 5.36l3.24 2.88C7.33 8.24 9.47 6.53 12 6.53Z"
   /> </svg>
);
}
