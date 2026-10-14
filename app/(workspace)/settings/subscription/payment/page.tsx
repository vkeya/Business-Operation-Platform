"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type PaymentState =
  | "CHECKING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "PENDING";

type PaymentStatusResponse = {
  success: boolean;
  payment?: {
	id: string;
    status: string;
  };
  invoice?: {
    status: string;
    plan: string;
	type: string;
  };
  subscription?: {
    status: string;
    plan: string;
  } | null;
  error?: string;
};

type PaymentPageProps = {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
	paymentId?: string;
  }>;
};

export default function SubscriptionPaymentPage({
  searchParams,
}: PaymentPageProps) {
  const [reference, setReference] = useState<string | null>(null);
  const [state, setState] = useState<PaymentState>("CHECKING");
  const [message, setMessage] = useState(
    "Checking your payment confirmation...",
  );
  const [plan, setPlan] = useState<string | null>(null);

  const [isAddOnPayment, setIsAddOnPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkPaymentStatus(
      lookup: { reference?: string; paymentId?: string },
    ) {
      try {
        const query = lookup.paymentId
          ? `paymentId=${encodeURIComponent(lookup.paymentId)}`
          : `reference=${encodeURIComponent(lookup.reference ?? "")}`;

        const response = await fetch(
          `/api/subscription/payment-status?${query}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as PaymentStatusResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to check payment status.",
          );
        }

        const paymentStatus =
          result.payment?.status?.toUpperCase();

        const invoiceStatus =
          result.invoice?.status?.toUpperCase();

        const subscriptionStatus =
          result.subscription?.status?.toUpperCase();


        if (
          paymentStatus === "SUCCEEDED" &&
          invoiceStatus === "PAID"
        ) {
          const invoiceType = result.invoice?.type?.toUpperCase();

          if (
            invoiceType === "SUBSCRIPTION_PURCHASE" &&
            subscriptionStatus !== "ACTIVE"
          ) {
            setState("PENDING");
            setMessage(
              "Payment was received. We are waiting for subscription activation to complete.",
            );

            timer = setTimeout(() => {
              void checkPaymentStatus(lookup);
            }, 3000);

            return;
          }

          if (
            invoiceType === "SUBSCRIPTION_PURCHASE" ||
            invoiceType === "SUBSCRIPTION_ADD_ON"
          ) {

			setIsAddOnPayment(
              invoiceType === "SUBSCRIPTION_ADD_ON",
            );

            setPlan(
              result.subscription?.plan ??
                result.invoice?.plan ??
                null,
            );
            setState("SUCCEEDED");
            setMessage(
              invoiceType === "SUBSCRIPTION_ADD_ON"
                ? "Your add-on payment has been confirmed successfully."
                : "Your payment has been confirmed and your subscription is now active.",
            );
            return;
          }
        }


        if (paymentStatus === "FAILED") {
          setState("FAILED");
          setMessage(
            "Your subscription payment was not completed.",
          );
          return;
        }

        if (paymentStatus === "CANCELLED") {
          setState("CANCELLED");
          setMessage(
            "Your subscription payment was cancelled.",
          );
          return;
        }

        setState("PENDING");
        setMessage(
          "Your payment has been submitted. We are waiting for confirmation from the payment provider.",
        );

        timer = setTimeout(() => {
          void checkPaymentStatus(lookup);
        }, 3000);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState("PENDING");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm payment status.",
        );

        timer = setTimeout(() => {
          void checkPaymentStatus(lookup);
        }, 5000);
      }
    }

    searchParams.then((params) => {
  if (cancelled) {
    return;
  }

  const resolvedReference =
    params.reference?.trim() ||
    params.trxref?.trim() ||
    null;

  const resolvedPaymentId =
    params.paymentId?.trim() || null;

  setReference(resolvedReference);

  if (!resolvedReference && !resolvedPaymentId) {
    setState("FAILED");
    setMessage(
      "No payment reference or payment ID was returned.",
    );
    return;
  }

  void checkPaymentStatus({
    reference: resolvedReference ?? undefined,
    paymentId: resolvedPaymentId ?? undefined,
  });
});

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchParams]);

  const isSuccess = state === "SUCCEEDED";
  const isFailed =
    state === "FAILED" || state === "CANCELLED";

  return (
    <div className="mx-auto max-w-2xl py-10">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700"
              : isFailed
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : isFailed ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <Clock3 className="h-6 w-6" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
          {isSuccess
            ? "Payment confirmed"
            : isFailed
              ? "Payment not completed"
              : "Payment submitted"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message}
        </p>

        {isSuccess && plan && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              Active plan
            </p>

            <p className="mt-2 text-sm font-semibold text-emerald-900">
              {plan}
            </p>
          </div>
        )}

        {reference && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Payment reference
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {reference}
            </p>
          </div>
        )}

        {!isSuccess && !isFailed && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-amber-800">
              You can safely wait on this page. Subscription activation
              happens only after the payment provider confirms the payment.
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm leading-6 text-emerald-800">
              {isAddOnPayment
                ? "Your add-on payment is confirmed. You can continue using SmatPic."
                : "Your SmatPic subscription is active. You can now continue using your business operations."}
            </p>
          </div>
        )}

        {isFailed && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-800">
              No subscription activation was performed. You can return to
              subscription management and try again.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/settings/subscription"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return to subscription
          </Link>
        </div>
      </section>
    </div>
  );
}