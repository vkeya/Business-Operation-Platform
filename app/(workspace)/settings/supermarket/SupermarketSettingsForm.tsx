"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";

type SupermarketProfile = {
  id: string;
  businessId: string;
  storeType: string;
  weightedProductsEnabled: boolean;
  batchTrackingEnabled: boolean;
  expiryTrackingEnabled: boolean;
  loyaltyEnabled: boolean;
  promotionsEnabled: boolean;
  autoReplenishmentEnabled: boolean;
  isActive: boolean;
};

type Props = {
  profile: SupermarketProfile | null;
};

export default function SupermarketSettingsForm({
  profile,
}: Props) {
  const [form, setForm] = useState({
    storeType:
      profile?.storeType ?? "SUPERMARKET",
    weightedProductsEnabled:
      profile?.weightedProductsEnabled ?? false,
    batchTrackingEnabled:
      profile?.batchTrackingEnabled ?? true,
    expiryTrackingEnabled:
      profile?.expiryTrackingEnabled ?? true,
    loyaltyEnabled:
      profile?.loyaltyEnabled ?? false,
    promotionsEnabled:
      profile?.promotionsEnabled ?? true,
    autoReplenishmentEnabled:
      profile?.autoReplenishmentEnabled ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(
    null,
  );

  function updateField(
    field: keyof typeof form,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage(null);
    setError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        "/api/supermarket/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save supermarket settings.",
        );
      }

      setMessage(
        "Supermarket settings saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save supermarket settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Supermarket settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure how SmatPic operates your supermarket.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Store */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
              <ShoppingCart className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                Store
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Define the operating model for this supermarket.
              </p>

              <div className="mt-5 max-w-md">
                <label
                  htmlFor="storeType"
                  className="text-sm font-medium text-slate-700"
                >
                  Store type
                </label>

                <select
                  id="storeType"
                  value={form.storeType}
                  onChange={(event) =>
                    updateField(
                      "storeType",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="SUPERMARKET">
                    Supermarket
                  </option>
                  <option value="MINI_SUPERMARKET">
                    Mini supermarket
                  </option>
                  <option value="GROCERY">
                    Grocery store
                  </option>
                  <option value="CONVENIENCE">
                    Convenience store
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
              <Package className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                Inventory behaviour
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control how supermarket stock is tracked.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                <ToggleRow
                  label="Weighted products"
                  description="Allow products to be sold by weight."
                  checked={
                    form.weightedProductsEnabled
                  }
                  onChange={(value) =>
                    updateField(
                      "weightedProductsEnabled",
                      value,
                    )
                  }
                />

                <ToggleRow
                  label="Batch tracking"
                  description="Track inventory by batch where applicable."
                  checked={
                    form.batchTrackingEnabled
                  }
                  onChange={(value) =>
                    updateField(
                      "batchTrackingEnabled",
                      value,
                    )
                  }
                />

                <ToggleRow
                  label="Expiry tracking"
                  description="Track product expiry dates."
                  checked={
                    form.expiryTrackingEnabled
                  }
                  onChange={(value) =>
                    updateField(
                      "expiryTrackingEnabled",
                      value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customer & sales */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
              <Users className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                Customer & sales
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure customer engagement and promotional features.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                <ToggleRow
                  label="Customer loyalty"
                  description="Enable loyalty features for customers."
                  checked={form.loyaltyEnabled}
                  onChange={(value) =>
                    updateField(
                      "loyaltyEnabled",
                      value,
                    )
                  }
                />

                <ToggleRow
                  label="Promotions"
                  description="Enable supermarket promotional pricing."
                  checked={
                    form.promotionsEnabled
                  }
                  onChange={(value) =>
                    updateField(
                      "promotionsEnabled",
                      value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Automation */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
              <RefreshCw className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                Automation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Let SmatPic help maintain healthy stock levels.
              </p>

              <div className="mt-5">
                <ToggleRow
                  label="Automatic replenishment"
                  description="Use stock activity to identify replenishment needs."
                  checked={
                    form.autoReplenishmentEnabled
                  }
                  onChange={(value) =>
                    updateField(
                      "autoReplenishmentEnabled",
                      value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Status */}
        {(message || error) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-violet-600"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}