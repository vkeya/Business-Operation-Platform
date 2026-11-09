"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { businessTypeOptions } from "@/lib/business/businessTypes";
import { getSetupDefaults } from "@/lib/business/setupDefaults";
import { validateBusinessSetup } from "@/lib/business/setupValidation";
import { createBusinessAction } from "./action";
import {
  ArrowRight,
  Beer,
  Building2,
  Hotel,
  Hospital,
  Pill,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store,
  Utensils,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  countryOptions,
  currencyOptions,
  languageOptions,
} from "@/lib/localization/options";
import type {
  BusinessSetup,
  TaxPricingMode,
} from "@/types/setup";

import type { BusinessType } from "@/types";
import type { TranslationSet } from "@/lib/i18n";

interface SetupFormProps {
  translations: TranslationSet;
}

const businessTypeIcons: Record<BusinessType, LucideIcon> = {
  restaurant: Utensils,
  bar: Beer,
  wines_spirits: Wine,
  hotel: Hotel,
  hospital: Hospital,
  supermarket: ShoppingBasket,
  shop: Store,
  boutique: Shirt,
  pharmacy: Pill,
  other: Building2,
};

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

	const [taxEnabled, setTaxEnabled] = useState(false);
const [taxName, setTaxName] = useState("VAT");
const [taxRate, setTaxRate] = useState("0");
const [taxPricingMode, setTaxPricingMode] =
  useState<TaxPricingMode>("EXCLUSIVE");

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
		tax: {
  enabled: taxEnabled,
  name: taxName.trim(),
  rate: taxRate,
  pricingMode: taxPricingMode,
},
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
              SmatPic setup
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
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#F7FBFD] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#08B6D9]/10 text-sm font-bold text-[#08B6D9]">
              02
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-[#020817]">
                {t.setup.businessType}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t.setup.businessTypeDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">
              Choose your business category
            </p>

            <span className="rounded-full bg-[#08B6D9]/10 px-3 py-1 text-xs font-semibold text-[#087F9B]">
              10 categories available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businessTypeOptions.map((option) => {
              const selected = businessType === option.value;
              const CategoryIcon = businessTypeIcons[option.value];

              const labels = {
                restaurant: t.setup.restaurant,
                bar: t.setup.bar,
                wines_spirits: t.setup.winesSpirits,
                hotel: t.setup.hotel,
                hospital: t.setup.hospitalClinic,
                supermarket: t.setup.supermarket,
                shop: t.setup.shop,
                boutique: t.setup.boutique,
                pharmacy: t.setup.pharmacy,
                other: t.setup.otherBusiness,
              };

              const descriptions = {
                restaurant: t.setup.restaurantDescription,
                bar: t.setup.barDescription,
                wines_spirits: t.setup.winesSpiritsDescription,
                hotel: t.setup.hotelDescription,
                hospital: t.setup.hospitalClinicDescription,
                supermarket: t.setup.supermarketDescription,
                shop: t.setup.shopDescription,
                boutique: t.setup.boutiqueDescription,
                pharmacy: t.setup.pharmacyDescription,
                other: t.setup.otherBusinessDescription,
              };

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleBusinessTypeChange(option.value)}
                  className={`group relative flex min-h-[150px] flex-col rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#08B6D9]/20 ${
                    selected
                      ? "border-[#08B6D9] bg-[#F0FBFE] shadow-sm ring-1 ring-[#08B6D9]/20"
                      : "border-slate-200 bg-white hover:border-[#08B6D9]/50"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                        selected
                          ? "bg-[#020817] text-[#08B6D9]"
                          : "bg-slate-100 text-slate-600 group-hover:bg-[#08B6D9]/10 group-hover:text-[#087F9B]"
                      }`}
                    >
                      <CategoryIcon className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        selected
                          ? "border-[#08B6D9] bg-[#08B6D9] text-white"
                          : "border-slate-200 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="mt-4">
                    <p
                      className={`text-sm font-semibold ${
                        selected ? "text-[#020817]" : "text-slate-900"
                      }`}
                    >
                      {labels[option.value]}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      {descriptions[option.value]}
                    </p>
                  </div>

                  {selected && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#08B6D9] to-[#1683D8]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regional settings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#F7FBFD] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#08B6D9]/10 text-sm font-bold text-[#08B6D9]">
              03
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-[#020817]">
                {t.setup.regionalSettings}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t.setup.regionalSettingsDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 rounded-xl border border-[#08B6D9]/15 bg-[#F0FBFE] px-4 py-3">
            <p className="text-xs leading-5 text-slate-600">
              Your country selection automatically sets the recommended
              currency, language and timezone. You can adjust these values below.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-800">
                {t.setup.country}
              </label>
              <select
                id="country"
                value={country}
                onChange={(event) => handleCountryChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
              >
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-800">
                {t.setup.baseCurrency}
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} — {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-800">
                {t.setup.language}
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name} ({option.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-slate-800">
                {t.setup.timezone}
              </label>
              <input
                id="timezone"
                type="text"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tax configuration */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#F7FBFD] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#08B6D9]/10 text-sm font-bold text-[#08B6D9]">
              04
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#020817]">
                Tax configuration
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Configure how tax should be applied to transactions for this business.
                You can change these settings later.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Enable tax
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Automatically calculate tax on taxable transactions.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={taxEnabled}
              onClick={() => setTaxEnabled((current) => !current)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                taxEnabled ? "bg-[#08B6D9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  taxEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {taxEnabled && (
            <div className="grid gap-5 rounded-2xl border border-[#08B6D9]/20 bg-[#F7FCFE] p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <label htmlFor="taxName" className="block text-sm font-medium text-slate-800">
                  Tax name
                </label>
                <input
                  id="taxName"
                  type="text"
                  value={taxName}
                  onChange={(event) => setTaxName(event.target.value)}
                  placeholder="VAT"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
                />
              </div>

              <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-slate-800">
                  Tax rate (%)
                </label>
                <input
                  id="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={(event) => setTaxRate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="taxPricingMode" className="block text-sm font-medium text-slate-800">
                  Pricing mode
                </label>
                <select
                  id="taxPricingMode"
                  value={taxPricingMode}
                  onChange={(event) =>
                    setTaxPricingMode(event.target.value as TaxPricingMode)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#08B6D9] focus:ring-4 focus:ring-[#08B6D9]/10"
                >
                  <option value="EXCLUSIVE">
                    Tax exclusive — tax is added to the price
                  </option>
                  <option value="INCLUSIVE">
                    Tax inclusive — tax is included in the price
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* First location */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                {t.setup.firstLocation}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t.setup.firstLocationDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50/50 px-4 py-3">
            <p className="text-xs leading-relaxed text-slate-600">
              Configure your primary branch and inventory location. You can add
              more locations later from your workspace.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="branchName"
                className="block text-sm font-medium text-slate-800"
              >
                {t.setup.branchName}
              </label>
              <input
                id="branchName"
                type="text"
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
                placeholder={t.setup.mainBranchPlaceholder}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="branchCode"
                className="block text-sm font-medium text-slate-800"
              >
                {t.setup.branchCode}
              </label>
              <input
                id="branchCode"
                type="text"
                value={branchCode}
                onChange={(event) => setBranchCode(event.target.value)}
                placeholder="MAIN"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="warehouseName"
                className="block text-sm font-medium text-slate-800"
              >
                {t.setup.inventoryLocation}
              </label>
              <input
                id="warehouseName"
                type="text"
                value={warehouseName}
                onChange={(event) => setWarehouseName(event.target.value)}
                placeholder={t.setup.mainWarehousePlaceholder}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="warehouseCode"
                className="block text-sm font-medium text-slate-800"
              >
                {t.setup.locationCode}
              </label>
              <input
                id="warehouseCode"
                type="text"
                value={warehouseCode}
                onChange={(event) => setWarehouseCode(event.target.value)}
                placeholder="MAIN"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
          </div>
        </div>
      </section>


            {/* Setup summary */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              {t.setup.setupSummary}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Review your workspace configuration before continuing.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem
              label={t.setup.business}
              value={businessName || t.setup.notProvided}
            />

            <SummaryItem
              label={t.setup.type}
              value={selectedBusinessType?.label ?? t.setup.notProvided}
            />

            <SummaryItem
              label={t.setup.country}
              value={selectedCountry?.name ?? country}
            />

            <SummaryItem
              label={t.setup.currency}
              value={currency}
            />

            <SummaryItem
              label={t.setup.language}
              value={language}
            />

            <SummaryItem
              label={t.setup.timezone}
              value={timezone}
            />

            <SummaryItem
              label={t.setup.branch}
              value={branchName || t.setup.notProvided}
            />

            <SummaryItem
              label={t.setup.inventoryLocation}
              value={warehouseName || t.setup.notProvided}
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

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="text-sm font-semibold text-red-900">
            {t.setup.checkInformation}
          </p>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-red-700">
            {Object.values(errors).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action area */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-950/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 sm:flex">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">
              Ready to create your workspace?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              SmatPic will create your business, main branch and inventory
              location.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100 sm:w-auto"
        >
          {t.setup.continue}
          <ArrowRight className="h-4 w-4" />
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
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 transition hover:border-cyan-200 hover:bg-cyan-50/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    );
}