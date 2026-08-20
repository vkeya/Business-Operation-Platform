import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";
import { completeSaleAction } from "@/lib/sales/actions";

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

  const sale =
    await saleService.findById(
      business.id,
      saleId,
    );

  if (!sale) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href="/sales"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Sales
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Business / Sale
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {sale.referenceNumber}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {sale.items.length}{" "}
              {sale.items.length === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <div className="flex items-center gap-3">
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
      Complete sale
    </button>
  </form>
)}
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {sale.status}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {sale.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Sale items
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
                      SKU: {item.sku}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    Quantity:{" "}
{item.quantity.toString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {sale.currency}{" "}
                    {item.unitPrice.toFixed(2)} each
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
            Summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Discount
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Tax
              </span>

              <span className="font-medium text-slate-900">
                {sale.currency}{" "}
                {sale.taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">
                  Total
                </span>

                <span className="text-xl font-semibold text-slate-900">
                  {sale.currency}{" "}
                  {sale.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {sale.notes && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Notes
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