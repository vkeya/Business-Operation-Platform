"use client";

import { FormEvent, useState } from "react";
import { businessTypeOptions } from "@/lib/business/businessTypes";
import { getSetupDefaults } from "@/lib/business/setupDefaults";
import { validateBusinessSetup } from "@/lib/business/setupValidation";
import { createBusinessAction } from "./action";
import {
  countryOptions,
  currencyOptions,
  languageOptions,
} from "@/lib/localization/options";
import type { BusinessSetup } from "@/types/setup";
import type { BusinessType } from "@/types";

export default function SetupPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] =
    useState<BusinessType>("restaurant");

  const [country, setCountry] = useState("SS");
  const [currency, setCurrency] = useState("SSP");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Africa/Juba");

  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("MAIN");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseCode, setWarehouseCode] = useState("MAIN");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleCountryChange(value: string) {
    setCountry(value);

    const selectedCountry = countryOptions.find(
      (option) => option.code === value,
    );

    if (!selectedCountry) {
      return;
    }

    setCurrency(selectedCountry.currency);
    setLanguage(selectedCountry.language);
    setTimezone(selectedCountry.timezone);
  }

  function handleBusinessNameChange(value: string) {
    setBusinessName(value);

    const defaults = getSetupDefaults(value, businessType);

    setBranchName(defaults.branchName);
    setWarehouseName(defaults.warehouseName);

    if (errors.businessName) {
      setErrors((current) => {
        const next = { ...current };
        delete next.businessName;
        return next;
      });
    }
  }

  function handleBusinessTypeChange(value: BusinessType) {
    setBusinessType(value);

    const defaults = getSetupDefaults(businessName, value);

    setBranchName(defaults.branchName);
    setWarehouseName(defaults.warehouseName);
  }

  function buildSetup(): BusinessSetup {
    return {
      business: {
        name: businessName.trim(),
        type: businessType,
        country,
        baseCurrency: currency,
        language,
        timezone,
      },
      branch: {
        name: branchName.trim(),
        code: branchCode.trim().toUpperCase(),
      },
      warehouse: {
        name: warehouseName.trim(),
        code: warehouseCode.trim().toUpperCase(),
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(false);

    const setup = buildSetup();
    const validation = validateBusinessSetup(setup);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

try {
  await createBusinessAction(setup, "setup-user");
  setSubmitted(true);
} catch (error) {
  console.error("Failed to create business:", error);

  setErrors({
    submit:
      error instanceof Error
        ? error.message
        : "Unable to save your business setup.",
  });
}
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Business setup
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Tell us about your business
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            We&apos;ll use this information to configure your workspace and
            give you the tools that matter most to your business.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Business information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start with the basics about your business.
              </p>
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-slate-900"
              >
                Business name
              </label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(event) =>
                  handleBusinessNameChange(event.target.value)
                }
                placeholder="e.g. Keya Restaurant"
                required
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                  errors.businessName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                }`}
              />

              {errors.businessName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.businessName}
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Business type
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This helps us prepare the right tools for your business.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {businessTypeOptions.map((option) => {
                const selected = businessType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleBusinessTypeChange(option.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {option.label}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {option.description}
                        </p>
                      </div>

                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Regional settings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                We&apos;ll use your country as a starting point, but you can
                customize these settings.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-slate-900"
                >
                  Country
                </label>

                <select
                  id="country"
                  value={country}
                  onChange={(event) =>
                    handleCountryChange(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-slate-900"
                >
                  Base currency
                </label>

                <select
                  id="currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} — {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-slate-900"
                >
                  Language
                </label>

                <select
                  id="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} ({option.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-slate-900"
                >
                  Timezone
                </label>

                <input
                  id="timezone"
                  type="text"
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                First location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start with one branch and one inventory location. You can add
                more later.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium text-slate-900"
                >
                  Branch name
                </label>

                <input
                  id="branchName"
                  type="text"
                  value={branchName}
                  onChange={(event) => setBranchName(event.target.value)}
                  placeholder="Main Branch"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="branchCode"
                  className="block text-sm font-medium text-slate-900"
                >
                  Branch code
                </label>

                <input
                  id="branchCode"
                  type="text"
                  value={branchCode}
                  onChange={(event) => setBranchCode(event.target.value)}
                  placeholder="MAIN"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="warehouseName"
                  className="block text-sm font-medium text-slate-900"
                >
                  Inventory location
                </label>

                <input
                  id="warehouseName"
                  type="text"
                  value={warehouseName}
                  onChange={(event) => setWarehouseName(event.target.value)}
                  placeholder="Main Warehouse"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="warehouseCode"
                  className="block text-sm font-medium text-slate-900"
                >
                  Location code
                </label>

                <input
                  id="warehouseCode"
                  type="text"
                  value={warehouseCode}
                  onChange={(event) => setWarehouseCode(event.target.value)}
                  placeholder="MAIN"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Setup summary
            </p>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-900">Business:</span>{" "}
                {businessName || "Not provided"}
              </p>

              <p>
                <span className="font-medium text-slate-900">Type:</span>{" "}
                {
                  businessTypeOptions.find(
                    (option) => option.value === businessType,
                  )?.label
                }
              </p>

              <p>
                <span className="font-medium text-slate-900">Country:</span>{" "}
                {countryOptions.find((option) => option.code === country)
                  ?.name ?? country}
              </p>

              <p>
                <span className="font-medium text-slate-900">Currency:</span>{" "}
                {currency}
              </p>

              <p>
                <span className="font-medium text-slate-900">Language:</span>{" "}
                {language}
              </p>

              <p>
                <span className="font-medium text-slate-900">Timezone:</span>{" "}
                {timezone}
              </p>

              <p>
                <span className="font-medium text-slate-900">Branch:</span>{" "}
                {branchName || "Not provided"}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  Inventory location:
                </span>{" "}
                {warehouseName || "Not provided"}
              </p>
            </div>
          </section>

          {submitted && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              Your business setup is valid and ready to be saved.
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-900">
                Please check the highlighted information.
              </p>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {Object.values(errors).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Continue setup
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}