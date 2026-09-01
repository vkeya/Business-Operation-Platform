import Link from "next/link";
import {
  getBusinessRolesAction,
} from "../actions";
import InviteUserForm from "./InviteUserForm";

export const dynamic = "force-dynamic";

export default async function InviteBusinessUserPage() {
  const roles =
    await getBusinessRolesAction();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-10">
      <section>
        <Link
          href="/settings/users"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to Users
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          Business Administration
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Invite User
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Invite a new user and assign their role in
          this business.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <InviteUserForm roles={roles} />
      </section>
    </div>
  );
}