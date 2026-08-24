import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";
import {
  completeSaleAction,
  getSalePaymentsAction,
} from "@/lib/sales/actions";
import RecordPaymentForm from "./RecordPaymentForm";
import { getTranslations } from "@/lib/i18n";

interface SaleDetailPageProps {
  params: Promise<{
    saleId: string;
  }>;
}

export default async function SaleDetailPage({
  params,
}: SaleDetailPageProps) {
  const { saleId } = await params;

  const business =
    await getCurrentBusiness();

  const t = await getTranslations();

  const sale =
    await saleService.findById(
      business.id,
      saleId,
    );

  if (!sale) {
    notFound();
  }

  const payments =
    await getSalePaymentsAction(
      sale.id,
    );

  const paidAmount =
    payments.reduce(
      (total, payment) =>
        total + payment.amount,
      0,
    );

  const outstandingAmount =
    Math.max(
      sale.totalAmount - paidAmount,
      0,
    );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href="/sales"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          {t.saleDetail.backToSales}
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {t.saleDetail.breadcrumb}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {sale.referenceNumber}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {sale.items.length}{" "}
              {sale.items.length === 1
                ? t.saleDetail.item
                : t.saleDetail.items}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {sale.status === "DRAFT" && (
              <form
                action={async () => {
                  "use server";

                  await completeSaleAction(
                    sale.id,
                  );
                }}
              >
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {t.saleDetail.completeSale}
                </button>
              </form>
            )}

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {sale.status}
            </span>

            <span
              className={
                sale.paymentStatus === "PAID"
                  ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                  : sale.paymentStatus ===
                      "PARTIAL"
                    ? "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                    : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              }
            >
              {sale.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.saleDetail.saleItems}
          </h2>

          <div className="mt-5 divide-y divide-slate-100">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.productName}
                  </p>

                  {item.sku && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t.saleDetail.sku}:{" "}
                      {item.sku}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    {t.saleDetail.quantity}:{" "}
                    {item.quantity.toString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {sale.currency}{" "}
                    {item.unitPrice.toFixed(2)}{" "}
                    {t.saleDetail.each}
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {sale.currency}{" "}
                    {item.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.saleDetail.summary}
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">
                {t.saleDetail.subtotal}
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                {t.saleDetail.discount}
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                {t.saleDetail.tax}
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">
                  {t.saleDetail.total}
                </span>

                <span className="text-xl font-semibold text-slate-900">
                  {sale.currency}{" "}
                  {sale.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t.saleDetail.payments}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.saleDetail.paymentsReceived}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {t.saleDetail.paid}
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {sale.currency}{" "}
                  {paidAmount.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {t.saleDetail.outstanding}
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {sale.currency}{" "}
                  {outstandingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-700">
                {t.saleDetail.noPaymentsRecorded}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {t.saleDetail.paymentsWillAppearHere}
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {payment.reference}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {payment.method}
                      {" · "}
                      {new Date(
                        payment.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {payment.currency}{" "}
                    {payment.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {outstandingAmount > 0 &&
            sale.status !== "CANCELLED" && (
              <RecordPaymentForm
                saleId={sale.id}
                currency={sale.currency}
                outstandingAmount={
                  outstandingAmount
                }
              />
            )}
        </section>

        {sale.notes && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.saleDetail.notes}
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {sale.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}