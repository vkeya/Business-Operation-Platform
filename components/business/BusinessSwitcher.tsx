"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BusinessOption {
  id: string;
  name: string;
  type: string;
}

interface BusinessSwitcherProps {
  businesses: BusinessOption[];
  currentBusinessId: string;
}

export default function BusinessSwitcher({
  businesses,
  currentBusinessId,
}: BusinessSwitcherProps) {
  const router = useRouter();
  const [switching, setSwitching] =
    useState(false);

  async function handleChange(
    businessId: string,
  ) {
    if (
      !businessId ||
      businessId === currentBusinessId
    ) {
      return;
    }

    setSwitching(true);

    try {
      const response = await fetch(
        "/api/businesses/switch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Unable to switch business.",
        );
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      setSwitching(false);
    }
  }

  return (
    <div className="mt-4">
      <label
        htmlFor="business-switcher"
        className="sr-only"
      >
        Switch business
      </label>

      <select
        id="business-switcher"
        value={currentBusinessId}
        disabled={switching}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
      >
        {businesses.map((business) => (
          <option
            key={business.id}
            value={business.id}
          >
            {business.name}
          </option>
        ))}
      </select>
    </div>
  );
}