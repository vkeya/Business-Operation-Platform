
"use client";

import { useState } from "react";

type HospitalProfile = {
  id: string;
  businessId: string;
  facilityName: string | null;
  facilityType: string | null;
  registrationNumber: string | null;
  licenseNumber: string | null;
  country: string;
  county: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

type Props = {
  profile: HospitalProfile;
};

export default function HospitalSettingsForm({
  profile,
}: Props) {
  const [form, setForm] = useState({
    facilityName: profile.facilityName ?? "",
    facilityType: profile.facilityType ?? "",
    registrationNumber: profile.registrationNumber ?? "",
    licenseNumber: profile.licenseNumber ?? "",
    country: profile.country ?? "Kenya",
    county: profile.county ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    isActive: profile.isActive,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string | boolean,
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
      const response = await fetch("/api/hospital/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to save hospital profile.",
        );
      }

      setMessage("Hospital profile saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save hospital profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fields: {
    key: Exclude<keyof typeof form, "isActive">;
    label: string;
    type?: string;
  }[] = [
    { key: "facilityName", label: "Facility name" },
    { key: "facilityType", label: "Facility type" },
    { key: "registrationNumber", label: "Registration number" },
    { key: "licenseNumber", label: "Licence number" },
    { key: "country", label: "Country" },
    { key: "county", label: "County" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "email", label: "Email", type: "email" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hospital settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your facility information and registration details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map(({ key, label, type }) => (
            <label key={key} className="block space-y-2">
              <span className="text-sm font-medium">
                {label}
              </span>
              <input
                type={type ?? "text"}
                value={form[key]}
                onChange={(event) =>
                  updateField(key, event.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
                autoComplete="off"
              />
            </label>
          ))}
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              updateField("isActive", event.target.checked)
            }
          />
          Facility profile is active
        </label>

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save hospital settings"}
        </button>
      </form>
    </div>
  );
}
