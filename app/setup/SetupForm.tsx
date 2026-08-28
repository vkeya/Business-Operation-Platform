"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { TranslationSet } from "@/lib/i18n";

interface SetupFormProps {
  translations: TranslationSet;
}

export default function SetupForm({
  translations: t,
}: SetupFormProps) {
  const router = useRouter();

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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
  const business =
    await createBusinessAction(
      setup,
      "setup-user",
    );

  const response = await fetch(
    "/api/businesses/switch",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        businessId: business.business.id,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to activate the new business.",
    );
  }

  setSubmitted(true);

  router.push("/dashboard");
  router.refresh();
} catch (error) {
      console.error("Failed to create business:", error);

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : t.setup.unableToSaveSetup,
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            {t.setup.title}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {t.setup.heading}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            {t.setup.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {[
            ["businessName", t.setup.businessName],
            ["businessType", t.setup.businessType],
            ["regionalSettings", t.setup.regionalSettings],
            ["firstLocation", t.setup.firstLocation],
          ].map(() => null)}

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t.setup.businessInformation}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.setup.businessInformationDescription}
              </p>
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-slate-900"
              >
                {t.setup.businessName}
              </label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(event) =>
                  handleBusinessNameChange(event.target.value)
                }
                placeholder={t.setup.businessNamePlaceholder}
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
                {t.setup.businessType}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.setup.businessTypeDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {businessTypeOptions.map((option) => {
                const selected = businessType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleBusinessTypeChange(option.value)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">
  {{
    restaurant: t.setup.restaurant,
    bar: t.setup.bar,
	wines_spirits: t.setup.winesSpirits,
    hotel: t.setup.hotel,
    hospital: t.setup.hospitalClinic,
    supermarket: t.setup.supermarket,
    shop: t.setup.shop,
	boutique: t.setup.boutique,
    other: t.setup.otherBusiness,
  }[option.value]}
</p>

<p className="mt-1 text-sm leading-5 text-slate-500">
  {{
    restaurant: t.setup.restaurantDescription,
    bar: t.setup.barDescription,
	wines_spirits: t.setup.winesSpiritsDescription,
    hotel: t.setup.hotelDescription,
    hospital: t.setup.hospitalClinicDescription,
    supermarket: t.setup.supermarketDescription,
    shop: t.setup.shopDescription,
	 boutique: t.setup.boutiqueDescription,
    other: t.setup.otherBusinessDescription,
  }[option.value]}
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
                {t.setup.regionalSettings}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.setup.regionalSettingsDescription}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-slate-900"
                >
                  {t.setup.country}
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
                  {t.setup.baseCurrency}
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value)
                  }
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
                  {t.setup.language}
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
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
                  {t.setup.timezone}
                </label>
                <input
                  id="timezone"
                  type="text"
                  value={timezone}
                  onChange={(event) =>
                    setTimezone(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t.setup.firstLocation}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.setup.firstLocationDescription}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium text-slate-900"
                >
                  {t.setup.branchName}
                </label>
                <input
                  id="branchName"
                  type="text"
                  value={branchName}
                  onChange={(event) =>
                    setBranchName(event.target.value)
                  }
                  placeholder={t.setup.mainBranchPlaceholder}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="branchCode"
                  className="block text-sm font-medium text-slate-900"
                >
                  {t.setup.branchCode}
                </label>
                <input
                  id="branchCode"
                  type="text"
                  value={branchCode}
                  onChange={(event) =>
                    setBranchCode(event.target.value)
                  }
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
                  {t.setup.inventoryLocation}
                </label>
                <input
                  id="warehouseName"
                  type="text"
                  value={warehouseName}
                  onChange={(event) =>
                    setWarehouseName(event.target.value)
                  }
                  placeholder={t.setup.mainWarehousePlaceholder}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="warehouseCode"
                  className="block text-sm font-medium text-slate-900"
                >
                  {t.setup.locationCode}
                </label>
                <input
                  id="warehouseCode"
                  type="text"
                  value={warehouseCode}
                  onChange={(event) =>
                    setWarehouseCode(event.target.value)
                  }
                  placeholder="MAIN"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              {t.setup.setupSummary}
            </p>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.business}:
                </span>{" "}
                {businessName || t.setup.notProvided}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.type}:
                </span>{" "}
                {
                  businessTypeOptions.find(
                    (option) => option.value === businessType,
                  )?.label
                }
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.country}:
                </span>{" "}
                {countryOptions.find(
                  (option) => option.code === country,
                )?.name ?? country}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.currency}:
                </span>{" "}
                {currency}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.language}:
                </span>{" "}
                {language}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.timezone}:
                </span>{" "}
                {timezone}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.branch}:
                </span>{" "}
                {branchName || t.setup.notProvided}
              </p>

              <p>
                <span className="font-medium text-slate-900">
                  {t.setup.inventoryLocation}:
                </span>{" "}
                {warehouseName || t.setup.notProvided}
              </p>
            </div>
          </section>

          {submitted && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {t.setup.setupReady}
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-900">
                {t.setup.checkInformation}
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
              {t.setup.continue}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}