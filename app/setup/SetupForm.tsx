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

  const [businessName, setBusinessName] =
    useState("");

  const [businessType, setBusinessType] =
    useState<BusinessType>("restaurant");

  const [country, setCountry] =
    useState("SS");

  const [currency, setCurrency] =
    useState("SSP");

  const [language, setLanguage] =
    useState("en");

  const [timezone, setTimezone] =
    useState("Africa/Juba");

  const [branchName, setBranchName] =
    useState("");

  const [branchCode, setBranchCode] =
    useState("MAIN");

  const [warehouseName, setWarehouseName] =
    useState("");

  const [warehouseCode, setWarehouseCode] =
    useState("MAIN");

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [submitted, setSubmitted] =
    useState(false);

  function handleCountryChange(
    value: string,
  ) {
    setCountry(value);

    const selectedCountry =
      countryOptions.find(
        (option) =>
          option.code === value,
      );

    if (!selectedCountry) {
      return;
    }

    setCurrency(
      selectedCountry.currency,
    );

    setLanguage(
      selectedCountry.language,
    );

    setTimezone(
      selectedCountry.timezone,
    );
  }

  function handleBusinessNameChange(
    value: string,
  ) {
    setBusinessName(value);

    const defaults =
      getSetupDefaults(
        value,
        businessType,
      );

    setBranchName(
      defaults.branchName,
    );

    setWarehouseName(
      defaults.warehouseName,
    );

    if (errors.businessName) {
      setErrors((current) => {
        const next = {
          ...current,
        };

        delete next.businessName;

        return next;
      });
    }
  }

  function handleBusinessTypeChange(
    value: BusinessType,
  ) {
    setBusinessType(value);

    const defaults =
      getSetupDefaults(
        businessName,
        value,
      );

    setBranchName(
      defaults.branchName,
    );

    setWarehouseName(
      defaults.warehouseName,
    );
  }

  function buildSetup(): BusinessSetup {
    return {
      business: {
        name:
          businessName.trim(),
        type:
          businessType,
        country,
        baseCurrency:
          currency,
        language,
        timezone,
      },

      branch: {
        name:
          branchName.trim(),
        code:
          branchCode
            .trim()
            .toUpperCase(),
      },

      warehouse: {
        name:
          warehouseName.trim(),
        code:
          warehouseCode
            .trim()
            .toUpperCase(),
      },
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitted(false);

    const setup =
      buildSetup();

    const validation =
      validateBusinessSetup(setup);

    if (!validation.isValid) {
      setErrors(
        validation.errors,
      );

      return;
    }

    setErrors({});

    try {
      const business =
        await createBusinessAction(
          setup,
        );

      const response =
        await fetch(
          "/api/businesses/switch",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              businessId:
                business.business.id,
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
      console.error(
        "Failed to create business:",
        error,
      );

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : t.setup
                .unableToSaveSetup,
      });
    }
  }

  const selectedBusinessType =
    businessTypeOptions.find(
      (option) =>
        option.value ===
        businessType,
    );

  const selectedCountry =
    countryOptions.find(
      (option) =>
        option.code === country,
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Progress overview */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Teketeke setup
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              Configure your business foundation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Business
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-700">
                Setup
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Location
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-700">
                Main
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              01
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {t.setup.businessInformation}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {
                  t.setup
                    .businessInformationDescription
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
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
                handleBusinessNameChange(
                  event.target.value,
                )
              }
              placeholder={
                t.setup
                  .businessNamePlaceholder
              }
              required
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                errors.businessName
                  ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                  : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
              }`}
            />

            {errors.businessName && (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors.businessName
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Business type */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              02
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {t.setup.businessType}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {
                  t.setup
                    .businessTypeDescription
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypeOptions.map(
              (option) => {
                const selected =
                  businessType ===
                  option.value;

                const labels = {
                  restaurant:
                    t.setup.restaurant,
                  bar:
                    t.setup.bar,
                  wines_spirits:
                    t.setup.winesSpirits,
                  hotel:
                    t.setup.hotel,
                  hospital:
                    t.setup
                      .hospitalClinic,
                  supermarket:
                    t.setup.supermarket,
                  shop:
                    t.setup.shop,
                  boutique:
                    t.setup.boutique,
                  other:
                    t.setup.otherBusiness,
                };

                const descriptions = {
                  restaurant:
                    t.setup
                      .restaurantDescription,
                  bar:
                    t.setup
                      .barDescription,
                  wines_spirits:
                    t.setup
                      .winesSpiritsDescription,
                  hotel:
                    t.setup
                      .hotelDescription,
                  hospital:
                    t.setup
                      .hospitalClinicDescription,
                  supermarket:
                    t.setup
                      .supermarketDescription,
                  shop:
                    t.setup
                      .shopDescription,
                  boutique:
                    t.setup
                      .boutiqueDescription,
                  other:
                    t.setup
                      .otherBusinessDescription,
                };

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleBusinessTypeChange(
                        option.value,
                      )
                    }
                    className={`group rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            selected
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {
                            labels[
                              option.value
                            ]
                          }
                        </p>

                        <p
                          className={`mt-1.5 text-sm leading-5 ${
                            selected
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          {
                            descriptions[
                              option.value
                            ]
                          }
                        </p>
                      </div>

                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          selected
                            ? "border-white bg-white text-slate-950"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Regional settings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              03
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {t.setup.regionalSettings}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {
                  t.setup
                    .regionalSettingsDescription
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
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
                  handleCountryChange(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                {countryOptions.map(
                  (option) => (
                    <option
                      key={option.code}
                      value={option.code}
                    >
                      {option.name}
                    </option>
                  ),
                )}
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
                  setCurrency(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                {currencyOptions.map(
                  (option) => (
                    <option
                      key={option.code}
                      value={option.code}
                    >
                      {option.code} —{" "}
                      {option.name}
                    </option>
                  ),
                )}
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
                  setLanguage(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                {languageOptions.map(
                  (option) => (
                    <option
                      key={option.code}
                      value={option.code}
                    >
                      {option.name} (
                      {
                        option.nativeName
                      }
                      )
                    </option>
                  ),
                )}
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
                  setTimezone(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* First location */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              04
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {t.setup.firstLocation}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {
                  t.setup
                    .firstLocationDescription
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
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
                  setBranchName(
                    event.target.value,
                  )
                }
                placeholder={
                  t.setup
                    .mainBranchPlaceholder
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
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
                  setBranchCode(
                    event.target.value,
                  )
                }
                placeholder="MAIN"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="warehouseName"
                className="block text-sm font-medium text-slate-900"
              >
                {
                  t.setup
                    .inventoryLocation
                }
              </label>

              <input
                id="warehouseName"
                type="text"
                value={warehouseName}
                onChange={(event) =>
                  setWarehouseName(
                    event.target.value,
                  )
                }
                placeholder={
                  t.setup
                    .mainWarehousePlaceholder
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
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
                  setWarehouseCode(
                    event.target.value,
                  )
                }
                placeholder="MAIN"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Setup summary */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <p className="text-lg font-semibold tracking-tight text-slate-900">
            {t.setup.setupSummary}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Review your workspace configuration
            before continuing.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem
              label={
                t.setup.business
              }
              value={
                businessName ||
                t.setup.notProvided
              }
            />

            <SummaryItem
              label={
                t.setup.type
              }
              value={
                selectedBusinessType
                  ?.label ??
                t.setup.notProvided
              }
            />

            <SummaryItem
              label={
                t.setup.country
              }
              value={
                selectedCountry
                  ?.name ??
                country
              }
            />

            <SummaryItem
              label={
                t.setup.currency
              }
              value={currency}
            />

            <SummaryItem
              label={
                t.setup.language
              }
              value={language}
            />

            <SummaryItem
              label={
                t.setup.timezone
              }
              value={timezone}
            />

            <SummaryItem
              label={
                t.setup.branch
              }
              value={
                branchName ||
                t.setup.notProvided
              }
            />

            <SummaryItem
              label={
                t.setup
                  .inventoryLocation
              }
              value={
                warehouseName ||
                t.setup.notProvided
              }
            />
          </div>
        </div>
      </section>

      {submitted && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          {t.setup.setupReady}
        </div>
      )}

      {Object.keys(errors).length >
        0 && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="text-sm font-semibold text-red-900">
            {
              t.setup
                .checkInformation
            }
          </p>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-red-700">
            {Object.values(
              errors,
            ).map((error) => (
              <li key={error}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action area */}
      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur sm:flex sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-900">
            Ready to create your workspace?
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Teketeke will create your business,
            main branch and inventory location.
          </p>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          {t.setup.continue}

          <span
            aria-hidden="true"
            className="text-base leading-none"
          >
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 truncate text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}