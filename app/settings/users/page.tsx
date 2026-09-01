import Link from "next/link";
import {
  getBusinessRolesAction,
  getBusinessUserInvitationsAction,
  getBusinessUsersAction,
} from "./actions";
import RevokeInvitationButton from "./RevokeInvitationButton";
import ResendInvitationButton from "./ResendInvitationButton";

export const dynamic = "force-dynamic";

export default async function BusinessUsersPage() {
  const [users, roles, invitations] =
  await Promise.all([
    getBusinessUsersAction(),
    getBusinessRolesAction(),
    getBusinessUserInvitationsAction(),
  ]);
  
 

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Business Administration
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Users
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Manage user accounts, access, and roles
            for this business.
          </p>
        </div>

        <Link
          href="/settings/users/invite"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Invite User
        </Link>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Business Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Only users assigned to this business
              are shown here.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            {roles.length}{" "}
            {roles.length === 1
              ? "role"
              : "roles"}{" "}
            available
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {users.map((user) => (
            <div
              key={user.membershipId}
              className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">
                    {user.name}
                  </p>

                  {user.isOwner && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      Owner
                    </span>
                  )}

                  <span
                    className={
                      user.isActive
                        ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                    }
                  >
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    No role assigned
                  </span>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No users have been assigned to this business.
            </div>
          )}
        </div>
      </section>
	  
	  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
    <div>
      <h2 className="font-semibold text-slate-900">
        Invitations
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Invitations sent to people who have not yet
        joined this business.
      </p>
    </div>

    <p className="text-xs text-slate-400">
      {invitations.length}{" "}
      {invitations.length === 1
        ? "invitation"
        : "invitations"}
    </p>
  </div>

  <div className="divide-y divide-slate-200">
    {invitations.map((invitation) => {
      const isAccepted =
        invitation.acceptedAt !== null;

      const isExpired =
        !isAccepted &&
        invitation.expiresAt < new Date();

      const status = isAccepted
        ? "Accepted"
        : isExpired
          ? "Expired"
          : "Pending";

      return (
        <div
          key={invitation.id}
          className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-slate-900">
                {invitation.name ||
                  invitation.email}
              </p>

              <span
                className={
                  status === "Pending"
                    ? "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                    : status === "Accepted"
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                }
              >
                {status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {invitation.email}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Expires{" "}
              {invitation.expiresAt.toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
    {invitation.role.name}
  </span>

  {!invitation.acceptedAt &&
    invitation.expiresAt > new Date() && (
	<>
        <ResendInvitationButton
          invitationId={invitation.id}
        />
      <RevokeInvitationButton
        invitationId={invitation.id}
      />
	  </>
    )}
</div>
        </div>
      );
    })}

    {invitations.length === 0 && (
      <div className="px-6 py-10 text-center text-sm text-slate-500">
        No invitations have been sent for this
        business.
      </div>
    )}
  </div>
</section>

    </div>
  );
}