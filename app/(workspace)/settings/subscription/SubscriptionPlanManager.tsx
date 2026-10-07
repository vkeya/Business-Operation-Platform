"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2, Smartphone } from "lucide-react";

type SubscriptionPlan = "STARTER" | "PROFESSIONAL" | "BUSINESS";
type BillingCycle = "MONTHLY" | "ANNUAL";
type PaymentMethod = "MPESA" | "CARD";

type PlanPricing = {
  monthly: number;
  annual: number;
};

const PLAN_PRICING: Record<SubscriptionPlan, PlanPricing> = {
  STARTER: {
    monthly: 2500,
    annual: 25000,
  },
  PROFESSIONAL: {
    monthly: 5000,
    annual: 50000,
  },
  BUSINESS: {
    monthly: 10000,
    annual: 100000,
  },
};

const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
  STARTER: "Core business operations for growing businesses.",
  PROFESSIONAL:
    "Advanced reporting, intelligence, automation, and multi-location support.",
  BUSINESS:
    "The complete SmatPic platform with advanced automation and integrations.",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SubscriptionPlanManager() {
  const [plan, setPlan] = useState<SubscriptionPlan>("PROFESSIONAL");
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("MONTHLY");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("MPESA");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(
    () => PLAN_PRICING[plan][billingCycle === "MONTHLY" ? "monthly" : "annual"],
    [plan, billingCycle],
  );

  async function handlePurchase() {
    setError(null);

    if (paymentMethod === "MPESA" && !customerPhone.trim()) {
      setError("Enter the M-Pesa phone number to continue.");
      return;
    }

    if (!customerEmail.trim()) {
      setError("Enter your email address to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscription/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          currency: "KES",
          provider: "PAYSTACK",
          paymentMethod,
          customerPhone:
            paymentMethod === "MPESA"
              ? customerPhone.trim()
              : undefined,
          customerEmail: customerEmail.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Unable to start subscription payment.",
        );
      }

      const authorizationUrl =
        result?.payment?.providerResponse?.authorizationUrl;

      if (typeof authorizationUrl === "string" && authorizationUrl) {
        window.location.assign(authorizationUrl);
        return;
      }

      if (paymentMethod === "MPESA") {
        setError(
          "M-Pesa payment has been initiated. Complete the payment on your phone.",
        );
        return;
      }

      throw new Error(
        "Payment was created, but no Paystack checkout URL was returned.",
      );
    } catch (purchaseError) {
      setError(
        purchaseError instanceof Error
          ? purchaseError.message
          : "Unable to start subscription payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(PLAN_PRICING) as SubscriptionPlan[]).map(
          (option) => {
            const selected = option === plan;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setPlan(option)}
                disabled={isSubmitting}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  {option}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {PLAN_DESCRIPTIONS[option]}
                </p>

                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {formatCurrency(
                    PLAN_PRICING[option][
                      billingCycle === "MONTHLY"
                        ? "monthly"
                        : "annual"
                    ],
                  )}
                </p>

                <p className="text-[11px] text-slate-400">
                  {billingCycle === "MONTHLY"
                    ? "per month"
                    : "per year"}
                </p>
              </button>
            );
          },
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="subscription-billing-cycle"
            className="text-xs font-semibold text-slate-600"
          >
            Billing cycle
          </label>

          <select
            id="subscription-billing-cycle"
            value={billingCycle}
            onChange={(event) =>
              setBillingCycle(event.target.value as BillingCycle)
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="ANNUAL">Annual — save 2 months</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="subscription-email"
            className="text-xs font-semibold text-slate-600"
          >
            Billing email
          </label>

          <input
            id="subscription-email"
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="billing@example.com"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600">
          Payment method
        </p>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("MPESA")}
            disabled={isSubmitting}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              paymentMethod === "MPESA"
                ? "border-violet-500 bg-violet-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Smartphone className="h-5 w-5 text-violet-700" />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                M-Pesa
              </p>
              <p className="text-xs text-slate-500">
                Pay using your M-Pesa phone.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            disabled={isSubmitting}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              paymentMethod === "CARD"
                ? "border-violet-500 bg-violet-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <CreditCard className="h-5 w-5 text-violet-700" />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Card
              </p>
              <p className="text-xs text-slate-500">
                Continue securely with Paystack.
              </p>
            </div>
          </button>
        </div>
      </div>

      {paymentMethod === "MPESA" && (
        <div>
          <label
            htmlFor="subscription-phone"
            className="text-xs font-semibold text-slate-600"
          >
            M-Pesa phone number
          </label>

          <input
            id="subscription-phone"
            type="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="2547XXXXXXXX"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500"
          />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Amount due
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatCurrency(amount)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {plan} · {billingCycle === "MONTHLY" ? "Monthly" : "Annual"} · KES
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurchase}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {isSubmitting
            ? "Starting payment..."
            : paymentMethod === "CARD"
              ? "Continue to Paystack"
              : "Start M-Pesa payment"}
        </button>
      </div>
    </div>
  );
}