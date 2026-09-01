"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  resendBusinessUserInvitationAction,
} from "./actions";

interface ResendInvitationButtonProps {
  invitationId: string;
}

export default function ResendInvitationButton({
  invitationId,
}: ResendInvitationButtonProps) {
  const router = useRouter();

  const [isResending, setIsResending] =
    useState(false);

  async function handleResend() {
    setIsResending(true);

    try {
      await resendBusinessUserInvitationAction(
        invitationId,
      );

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to resend invitation.",
      );

      setIsResending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isResending}
      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isResending
        ? "Resending..."
        : "Resend"}
    </button>
  );
}