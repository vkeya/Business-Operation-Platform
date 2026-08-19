import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPurchaseByIdAction,
  getPurchasePaymentsAction,
} from "../action";
import OrderPurchaseButton from "../OrderPurchaseButton";
import ReceivePurchaseButton from "../ReceivePurchaseButton";
import CancelPurchaseButton from "../CancelPurchaseButton";
import RecordPaymentForm from "./RecordPaymentForm";

interface PurchaseDetailsPageProps {
  params: Promise<{
    purchaseId: string;
  }>;
}

export default async function PurchaseDetailsPage({
  params,
}: PurchaseDetailsPageProps) {
  const { purchaseId } = await params;

  const purchase =
    await getPurchaseByIdAction(purchaseId);
	
	const payments =
  await getPurchasePaymentsAction(purchaseId);
  
  if (!purchase) {
    notFound();
  }
  
  const paidAmount = payments.reduce(
  (total, payment) =>
    total + payment.amount,
  0,
);

const outstandingAmount = Math.max(
  purchase.totalAmount - paidAmount,
  0,
);

  

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href="/purchases"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to purchases
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">
            Purchasing
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Purchase {purchase.referenceNumber}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Review purchase details and supplier information.
          </p>
		  <div className="mt-5 flex flex-wrap items-center gap-2">
  {purchase.status === "DRAFT" && (
    <>
      <OrderPurchaseButton
        purchaseId={purchase.id}
      />

      <CancelPurchaseButton
        purchaseId={purchase.id}
      />
    </>
  )}

  {purchase.status === "ORDERED" && (
    <>
      <ReceivePurchaseButton
        purchaseId={purchase.id}
      />

      <CancelPurchaseButton
        purchaseId={purchase.id}
      />
    </>
  )}

  {purchase.status === "RECEIVED" && (
    <span className="text-sm text-slate-500">
      Purchase completed
    </span>
  )}

  {purchase.status === "CANCELLED" && (
    <span className="text-sm text-slate-500">
      Purchase cancelled
    </span>
  )}
</div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Supplier
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {purchase.supplier.name}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Receiving warehouse
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {purchase.warehouse?.name ?? "Not assigned"}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Status
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {purchase.status}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Payment
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {purchase.paymentStatus}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Date
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {new Date(
        purchase.createdAt,
      ).toLocaleDateString()}
    </p>
  </div>
  
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
    Supplier invoice
  </p>

  <p className="mt-2 font-semibold text-slate-900">
    {purchase.supplierInvoiceNumber ?? "Not provided"}
  </p>
</div>
</section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="font-semibold text-slate-900">
            Purchase items
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products included in this purchase.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit cost
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Discount
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tax
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {purchase.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {item.productName}
                    </p>

                    {item.sku && (
                      <p className="mt-1 text-xs text-slate-500">
                        {item.sku}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {Number(item.quantity).toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {purchase.currency}{" "}
                    {item.unitCost.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {purchase.currency}{" "}
                    {item.discountAmount.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {purchase.currency}{" "}
                    {item.taxAmount.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-900">
                    {purchase.currency}{" "}
                    {item.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
	  
	  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
  <div>
    <h2 className="font-semibold text-slate-900">
      Payments
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Payments recorded against this purchase.
    </p>
  </div>

  {payments.length === 0 ? (
    <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
      <p className="text-sm font-medium text-slate-700">
        No payments recorded
      </p>

      <p className="mt-1 text-xs text-slate-500">
        This purchase has no payments yet.
      </p>
    </div>
  ) : (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[650px]">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reference
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Method
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="px-4 py-4 text-sm font-medium text-slate-900">
                {payment.reference}
              </td>

              <td className="px-4 py-4 text-sm text-slate-600">
                {payment.method}
              </td>

              <td className="px-4 py-4 text-sm font-medium text-slate-900">
                {payment.currency}{" "}
                {payment.amount.toLocaleString()}
              </td>

              <td className="px-4 py-4">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {payment.status}
                </span>
              </td>

              <td className="px-4 py-4 text-sm text-slate-600">
                {new Date(
                  payment.createdAt,
                ).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

{outstandingAmount > 0 && (
  <RecordPaymentForm
    purchaseId={purchase.id}
    currency={purchase.currency}
    outstandingAmount={outstandingAmount}
  />
)}


      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Purchase summary
        </h2>

        <div className="mt-5 space-y-3 sm:ml-auto sm:max-w-sm">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">
              Subtotal
            </span>
            <span className="font-medium text-slate-900">
              {purchase.currency}{" "}
              {purchase.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">
              Discount
            </span>
            <span className="font-medium text-slate-900">
              {purchase.currency}{" "}
              {purchase.discountAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">
              Tax
            </span>
            <span className="font-medium text-slate-900">
              {purchase.currency}{" "}
              {purchase.taxAmount.toLocaleString()}
            </span>
          </div>

<div className="flex justify-between gap-4 text-sm">
  <span className="text-slate-500">
    Paid
  </span>

  <span className="font-medium text-slate-900">
    {purchase.currency}{" "}
    {paidAmount.toLocaleString()}
  </span>
</div>

<div className="flex justify-between gap-4 text-sm">
  <span className="text-slate-500">
    Outstanding
  </span>

  <span className="font-medium text-slate-900">
    {purchase.currency}{" "}
    {outstandingAmount.toLocaleString()}
  </span>
</div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-slate-900">
                Total
              </span>
              <span className="font-semibold text-slate-900">
                {purchase.currency}{" "}
                {purchase.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}