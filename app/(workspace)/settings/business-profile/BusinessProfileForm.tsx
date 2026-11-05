
"use client";

import { useState } from "react";

type BusinessProfile = {
  id: string;
  name: string;
  legalName: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxRegistrationNumber: string | null;
  receiptFooter: string | null;
  country: string;
  baseCurrency: string;
};

type FormState = {
  name: string;
  legalName: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  taxRegistrationNumber: string;
  receiptFooter: string;
};

type Props = {
  profile: BusinessProfile;
};

export default function BusinessProfileForm({ profile }: Props) {
  const [form, setForm] = useState<FormState>({
    name: profile.name ?? "",
    legalName: profile.legalName ?? "",
    logoUrl: profile.logoUrl ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    address: profile.address ?? "",
    taxRegistrationNumber: profile.taxRegistrationNumber ?? "",
    receiptFooter: profile.receiptFooter ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        legalName: form.legalName.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        taxRegistrationNumber:
          form.taxRegistrationNumber.trim() || null,
        receiptFooter: form.receiptFooter.trim() || null,
      };

      const response = await fetch("/api/businesses/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to save business profile.",
        );
      }

      setMessage("Business identity and receipt settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
  }[] = [
    {
      key: "name",
      label: "Business display name",
      required: true,
      placeholder: "e.g. QuickStop Stays",
    },
    {
      key: "legalName",
      label: "Registered legal name",
      placeholder: "Official registered business name",
    },
    {
      key: "logoUrl",
      label: "Business logo URL",
      type: "url",
      placeholder: "https://example.com/logo.png",
    },
    {
      key: "phone",
      label: "Business phone",
      type: "tel",
      placeholder: "+254...",
    },
    {
      key: "email",
      label: "Business email",
      type: "email",
      placeholder: "info@example.com",
    },
    {
      key: "taxRegistrationNumber",
      label: "Tax registration number",
      placeholder: "PIN / VAT / tax registration number",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
          Workspace configuration
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Business Identity & Receipt Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Maintain the business information used across SmatPic,
          including the details displayed on customer receipts.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Business information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              These details identify your business across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {fields.map(({ key, label, type, required, placeholder }) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                  {required && (
                    <span className="ml-1 text-red-600">*</span>
                  )}
                </span>

                <input
                  type={type ?? "text"}
                  value={form[key]}
                  required={required}
                  maxLength={key === "name" ? 160 : undefined}
                  onChange={(event) =>
                    updateField(key, event.target.value)
                  }
                  placeholder={placeholder}
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </label>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Business address
            </span>
            <textarea
              value={form.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              rows={3}
              maxLength={500}
              placeholder="Physical or registered business address"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </section>

        <div className="border-t border-slate-100" />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Receipt presentation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure the message printed at the bottom of customer receipts.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Receipt footer message
            </span>
            <textarea
              value={form.receiptFooter}
              onChange={(event) =>
                updateField("receiptFooter", event.target.value)
              }
              rows={3}
              maxLength={500}
              placeholder="Thank you for shopping with us. We appreciate your business."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
            <span className="text-xs text-slate-400">
              Maximum 500 characters.
            </span>
          </label>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Footer preview
            </p>
            <p className="mt-2 whitespace-pre-wrap text-center text-sm text-slate-600">
              {form.receiptFooter.trim() ||
                "Your receipt footer message will appear here."}
            </p>
          </div>
        </section>

        {message && (
          <p
            role="status"
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Changes are recorded in the business audit history.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving settings..." : "Save business settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
