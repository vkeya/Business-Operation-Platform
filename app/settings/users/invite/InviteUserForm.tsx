"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
createBusinessUserInvitationAction,
} from "../actions";

interface BusinessRole {
id: string;
name: string;
description: string | null;
permissions: string[];
isSystemRole: boolean;
}

interface InviteUserFormProps {
roles: BusinessRole[];
}

export default function InviteUserForm({
roles,
}: InviteUserFormProps) {
const router = useRouter();

const [isSubmitting, setIsSubmitting] =
useState(false);

const [error, setError] =
useState<string | null>(null);

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>,
) {
event.preventDefault();


setError(null);
setIsSubmitting(true);

const formData =
  new FormData(event.currentTarget);

const name =
  String(formData.get("name") ?? "");

const email =
  String(formData.get("email") ?? "");

const roleId =
  String(formData.get("roleId") ?? "");

try {

    await createBusinessUserInvitationAction({
      name,
      email,
      roleId,
    });

    router.push("/settings/users");
    router.refresh();

} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Unable to send invitation.",
  );
} finally {
  setIsSubmitting(false);
}
}

return ( <form
   onSubmit={handleSubmit}
   className="space-y-5"
 > <div> <label
       htmlFor="name"
       className="block text-sm font-medium text-slate-700"
     >
Full name </label>


    <input
      id="name"
      name="name"
      type="text"
      required
      autoComplete="name"
      disabled={isSubmitting}
      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:opacity-60"
    />
  </div>

  <div>
    <label
      htmlFor="email"
      className="block text-sm font-medium text-slate-700"
    >
      Email address
    </label>

    <input
      id="email"
      name="email"
      type="email"
      required
      autoComplete="email"
      disabled={isSubmitting}
      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:opacity-60"
    />
  </div>

  <div>
    <label
      htmlFor="roleId"
      className="block text-sm font-medium text-slate-700"
    >
      Business role
    </label>

    <select
      id="roleId"
      name="roleId"
      required
      disabled={isSubmitting}
      defaultValue=""
      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:opacity-60"
    >
      <option value="">
        Select a role
      </option>

      {roles
  .filter(
    (role) => role.name !== "Business Owner",
  )
  .map((role) => (
        <option
          key={role.id}
          value={role.id}
        >
          {role.name}
        </option>
      ))}
    </select>

    <p className="mt-2 text-xs text-slate-500">
      The invited user will receive the selected
      level of access when their invitation is
      accepted.
    </p>
  </div>

  {error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  )}

  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
    <button
      type="button"
      onClick={() =>
        router.push("/settings/users")
      }
      disabled={isSubmitting}
      className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting
        ? "Sending invitation..."
        : "Send Invitation"}
    </button>
  </div>
</form>


);
}
