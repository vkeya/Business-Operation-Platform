import Link from "next/link";
import { notFound } from "next/navigation";
import {
getAuthenticatedUser,
} from "@/lib/auth/auth";
import {
businessInvitationService,
} from "@/lib/business/businessInvitationService";

export const dynamic = "force-dynamic";

interface InvitationPageProps {
params: Promise<{
token: string;
}>;
}

export default async function InvitationPage({
params,
}: InvitationPageProps) {
const { token } = await params;

let invitation;

try {
invitation =
await businessInvitationService.getInvitation(
token,
);
} catch {
notFound();
}

let user = null;

try {
user =
await getAuthenticatedUser();
} catch {
user = null;
}

const userEmail =
user?.email
?.trim()
.toLowerCase();

const invitationEmail =
invitation.email
.trim()
.toLowerCase();

const emailMatches =
userEmail === invitationEmail;

return ( <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10"> <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"> <p className="text-sm font-medium text-slate-500">
Business Invitation </p>


    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
      You have been invited
    </h1>

    <p className="mt-3 text-sm leading-6 text-slate-600">
      You have been invited to join{" "}
      <span className="font-medium text-slate-900">
        {invitation.business.name}
      </span>
      .
    </p>

    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Invited email
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">
          {invitation.email}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Assigned role
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">
          {invitation.role.name}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Invitation expires
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">
          {invitation.expiresAt.toLocaleDateString()}
        </p>
      </div>
    </div>

    {user && !emailMatches && (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        You are signed in as{" "}
        <span className="font-medium">
          {user.email}
        </span>
        , but this invitation was sent to{" "}
        <span className="font-medium">
          {invitation.email}
        </span>
        .
      </div>
    )}

    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
      {!user && (
        <>
          <Link
            href={`/login?invitation=${encodeURIComponent(
              token,
            )}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            I already have an account
          </Link>

          <Link
            href={`/register?invitation=${encodeURIComponent(
              token,
            )}`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create account
          </Link>
        </>
      )}

      {user && emailMatches && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your account matches this invitation.
          You can now accept the invitation.
        </div>
      )}

      {user && !emailMatches && (
        <Link
          href={`/login?invitation=${encodeURIComponent(
            token,
          )}`}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Sign in with invited account
        </Link>
      )}
    </div>
  </div>
</div>


);
}
