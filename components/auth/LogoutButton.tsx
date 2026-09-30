"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({
  className,
}: LogoutButtonProps) {
  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(
        "Logout audit request failed:",
        error,
      );
    } finally {
      await signOut({
        callbackUrl: "/",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={
        className ??
        "rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {isSigningOut
        ? "Signing out..."
        : "Sign out"}
    </button>
  );
}