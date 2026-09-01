"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  revokeBusinessUserInvitationAction,
} from "./actions";

interface RevokeInvitationButtonProps {
  invitationId: string;
}

export default function RevokeInvitationButton({
  invitationId,
}: RevokeInvitationButtonProps) {
  const router = useRouter();

  const [isRevoking, setIsRevoking] =
    useState(false);

  async function handleRevoke() {
    const confirmed =
      window.confirm(
        "Are you sure you want to revoke this invitation?",
      );

    if (!confirmed) {
      return;
    }

    setIsRevoking(true);

    try {
      await revokeBusinessUserInvitationAction(
        invitationId,
      );

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to revoke invitation.",
      );

      setIsRevoking(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={isRevoking}
      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRevoking
        ? "Revoking..."
        : "Revoke"}
    </button>
  );
}