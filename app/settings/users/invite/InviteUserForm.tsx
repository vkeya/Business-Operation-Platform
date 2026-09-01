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

interface InvitationResult {
token: string;
email: string;
expiresAt: Date;
role: {
id: string;
name: string;
};
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

const [invitationUrl, setInvitationUrl] =
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
  const invitation:
    InvitationResult =
    await createBusinessUserInvitationAction({
      name,
      email,
      roleId,
    });

  const url =
    `${window.location.origin}/invitations/${encodeURIComponent(
      invitation.token,
    )}`;

  setInvitationUrl(url);
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

async function copyInvitationUrl() {
if (!invitationUrl) {
return;
}


try {
  await navigator.clipboard.writeText(
    invitationUrl,
  );
} catch {
  setError(
    "Unable to copy the invitation link.",
  );
}


}

if (invitationUrl) {
return ( <div className="space-y-6"> <div> <h2 className="text-lg font-semibold text-slate-900">
Invitation created </h2>


      <p className="mt-2 text-sm text-slate-600">
        Share this secure invitation link with
        the user.
      </p>
    </div>

    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-medium text-emerald-900">
        Invitation link
      </p>

      <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-3">
        <p className="break-all text-sm text-slate-700">
          {invitationUrl}
        </p>
      </div>

      <button
        type="button"
        onClick={copyInvitationUrl}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Copy invitation link
      </button>
    </div>

    <div className="flex justify-end border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={() => {
          router.push("/settings/users");
          router.refresh();
        }}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Back to Users
      </button>
    </div>
  </div>
);


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

      {roles.map((role) => (
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
        ? "Creating..."
        : "Create Invitation"}
    </button>
  </div>
</form>


);
}
