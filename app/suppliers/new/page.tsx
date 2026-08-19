"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplierAction } from "../action";
import { currencies } from "@/lib/currency/currencies";

export default function NewSupplierPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] =
    useState("");
  const [currency, setCurrency] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createSupplierAction({
        name,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        taxNumber: taxNumber || undefined,
        paymentTermsDays:
          paymentTermsDays === ""
            ? undefined
            : Number(paymentTermsDays),
        currency: currency || undefined,
      });

      router.push("/suppliers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the supplier.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Purchasing / Suppliers
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Add supplier
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Add a supplier your business purchases from.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Supplier information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900"
              >
                Supplier name
              </label>

              <input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. ABC Distributors"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-900"
              >
                Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-900"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-900"
              >
                Address
              </label>

              <textarea
                id="address"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                rows={3}
                placeholder="Optional supplier address"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="taxNumber"
                className="block text-sm font-medium text-slate-900"
              >
                Tax number
              </label>

              <input
                id="taxNumber"
                value={taxNumber}
                onChange={(event) =>
                  setTaxNumber(event.target.value)
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="paymentTermsDays"
                className="block text-sm font-medium text-slate-900"
              >
                Payment terms
              </label>

              <div className="mt-2 flex items-center gap-2">
                <input
                  id="paymentTermsDays"
                  type="number"
                  min="0"
                  step="1"
                  value={paymentTermsDays}
                  onChange={(event) =>
                    setPaymentTermsDays(
                      event.target.value,
                    )
                  }
                  placeholder="30"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <span className="text-sm text-slate-500">
                  days
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-900"
              >
                Currency
              </label>

              <select
                id="currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  Select currency
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

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/suppliers")}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}