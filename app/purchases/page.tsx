import Link from "next/link";
import { getPurchasesAction } from "./action";
import OrderPurchaseButton from "./OrderPurchaseButton";
import ReceivePurchaseButton from "./ReceivePurchaseButton";
import CancelPurchaseButton from "./CancelPurchaseButton";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const purchases = await getPurchasesAction();

  const draftPurchases = purchases.filter(
    (purchase) => purchase.status === "DRAFT",
  );

  const orderedPurchases = purchases.filter(
    (purchase) => purchase.status === "ORDERED",
  );

  const receivedPurchases = purchases.filter(
    (purchase) => purchase.status === "RECEIVED",
  );
  
  

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Purchasing
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Purchases
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage supplier purchases and incoming stock.
          </p>
        </div>

        <Link
          href="/purchases/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Record purchase
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Purchases
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {purchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Purchases on record
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Draft
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {draftPurchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Not yet ordered
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Ordered
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {orderedPurchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Awaiting receipt
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Received
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {receivedPurchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Stock received
          </p>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {purchases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              No purchases yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Record your first supplier purchase to start tracking
              purchasing activity.
            </p>

            <Link
              href="/purchases/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Record purchase
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
				  
				  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Actions
</th>

                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
  href={`/purchases/${purchase.id}`}
  className="text-sm font-medium text-slate-900 hover:underline"
>
  {purchase.referenceNumber}
</Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(
                          purchase.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {purchase.supplier.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {purchase.items.length}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {purchase.currency}{" "}
                      {Number(
                        purchase.totalAmount,
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {purchase.paymentStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {purchase.status}
                      </span>
                    </td>
					
					<td className="px-6 py-4">
					 <div className="flex min-w-[150px] flex-col items-start gap-2">
  <Link
  href={`/purchases/${purchase.id}`}
  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
>
  View details →
</Link>
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
      <span className="text-xs text-slate-400">
        Completed
      </span>
    )}

    {purchase.status === "CANCELLED" && (
      <span className="text-xs text-slate-400">
        Cancelled
      </span>
    )}
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}