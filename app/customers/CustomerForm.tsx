"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/lib/customers/actions";
import { currencies } from "@/lib/currency/currencies";
import { translations } from "@/lib/i18n/translations";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  creditLimit: number | null;
  currency: string | null;
  isActive: boolean;
};

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer;
  translations?: (typeof translations)["en"];
}

export default function CustomerForm({
  mode,
  customer,
  translations: t = translations.en,
}: CustomerFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [name, setName] = useState(
    customer?.name ?? "",
  );

  const [phone, setPhone] = useState(
    customer?.phone ?? "",
  );

  const [email, setEmail] = useState(
    customer?.email ?? "",
  );

  const [address, setAddress] = useState(
    customer?.address ?? "",
  );

  const [taxNumber, setTaxNumber] = useState(
    customer?.taxNumber ?? "",
  );

  const [creditLimit, setCreditLimit] = useState(
    customer?.creditLimit?.toString() ?? "",
  );

  const [currency, setCurrency] = useState(
    customer?.currency ?? "",
  );

  const [isActive, setIsActive] = useState(
    customer?.isActive ?? true,
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const parsedCreditLimit =
        creditLimit.trim() === ""
          ? undefined
          : Number(creditLimit);

      if (
        parsedCreditLimit !== undefined &&
        Number.isNaN(parsedCreditLimit)
      ) {
        throw new Error(
          t.customers.invalidCreditLimit,
        );
      }

      if (isEdit && customer) {
        await updateCustomerAction(customer.id, {
          name,
          phone: phone || undefined,
          email: email || undefined,
          address: address || undefined,
          taxNumber: taxNumber || undefined,
          creditLimit: parsedCreditLimit,
          currency: currency || undefined,
          isActive,
        });
      } else {
        await createCustomerAction({
          name,
          phone: phone || undefined,
          email: email || undefined,
          address: address || undefined,
          taxNumber: taxNumber || undefined,
          creditLimit: parsedCreditLimit,
          currency: currency || undefined,
        });
      }

      router.push("/customers");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.customers.unexpectedError,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.customers.customerInformation}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.customers.basicInformation}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.customerName}
            </label>

            <input
              id="name"
              name="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder={t.customers.customerName}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.phone}
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="+254..."
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.email}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder={t.customers.emailPlaceholder}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.address}
            </label>

            <textarea
              id="address"
              name="address"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder={t.customers.customerAddress}
            />
          </div>

          <div>
            <label
              htmlFor="taxNumber"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.taxNumber}
            </label>

            <input
              id="taxNumber"
              name="taxNumber"
              value={taxNumber}
              onChange={(event) =>
                setTaxNumber(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder={t.customers.taxNumberPlaceholder}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.customers.creditSettings}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.customers.optionalCreditInformation}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="creditLimit"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.creditLimit}
            </label>

            <input
              id="creditLimit"
              name="creditLimit"
              type="number"
              min="0"
              step="0.01"
              value={creditLimit}
              onChange={(event) =>
                setCreditLimit(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder={t.customers.creditLimitPlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-slate-700"
            >
              {t.customers.currency}
            </label>

            <select
              id="currency"
              name="currency"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">
                {t.customers.selectCurrency}
              </option>

              {currencies.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.code} — {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {isEdit && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                {t.customers.customerStatus}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.customers.inactiveCustomerDescription}
              </p>
            </div>

            <label className="flex shrink-0 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                {t.customers.active}
              </span>
            </label>
          </div>
        </section>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {t.common.cancel}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? t.common.loading
            : isEdit
              ? t.common.save
              : t.customers.createCustomer}
        </button>
      </div>
    </form>
  );
}