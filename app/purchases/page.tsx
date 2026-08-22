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

  const cancelledPurchases = purchases.filter(
    (purchase) => purchase.status === "CANCELLED",
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                Purchasing
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  orderedPurchases.length > 0
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {orderedPurchases.length > 0
                  ? `${orderedPurchases.length} awaiting receipt`
                  : "No orders awaiting receipt"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Purchases
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage supplier orders, incoming stock and
              purchasing activity from one place.
            </p>
          </div>

          <Link
            href="/purchases/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <span className="mr-2 text-emerald-600">
              +
            </span>
            Record purchase
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* Purchasing KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            All purchases
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {purchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Purchasing records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Draft
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {draftPurchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Ready to order
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
            Ordered
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-900">
            {orderedPurchases.length}
          </p>

          <p className="mt-2 text-xs text-amber-700">
            Awaiting delivery
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            Received
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-900">
            {receivedPurchases.length}
          </p>

          <p className="mt-2 text-xs text-emerald-700">
            Stock received
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Cancelled
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {cancelledPurchases.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Cancelled orders
          </p>
        </div>
      </section>

      {/* Workflow */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Workflow
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Purchasing flow
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Move purchases from planning to stock received.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                01
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  Draft
                </p>

                <p className="text-xs text-slate-500">
                  Prepare the purchase
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Create the supplier purchase and confirm
              the items and pricing.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-xs font-bold text-amber-700">
                02
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  Ordered
                </p>

                <p className="text-xs text-slate-500">
                  Await delivery
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Place the order with the supplier and wait
              for the stock to arrive.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                03
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  Received
                </p>

                <p className="text-xs text-slate-500">
                  Stock enters inventory
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Receive the purchase and bring the stock
              into your inventory records.
            </p>
          </div>
        </div>
      </section>

      {/* Purchase workspace */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              Purchase register
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Supplier purchases
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review purchasing activity and take action on
              outstanding orders.
            </p>
          </div>

          {purchases.length > 0 && (
            <Link
              href="/purchases/new"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              + Record another purchase
            </Link>
          )}
        </div>

        {purchases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              +
            </div>

            <p className="mt-5 text-lg font-semibold text-slate-950">
              No purchases yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Record your first supplier purchase to start
              tracking purchasing activity and incoming
              stock.
            </p>

            <Link
              href="/purchases/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Record your first purchase
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Purchase
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Supplier
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Items
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Total
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Payment
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => {
                  const isDraft =
                    purchase.status === "DRAFT";

                  const isOrdered =
                    purchase.status === "ORDERED";

                  const isReceived =
                    purchase.status === "RECEIVED";

                  const isCancelled =
                    purchase.status === "CANCELLED";

                  return (
                    <tr
                      key={purchase.id}
                      className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/purchases/${purchase.id}`}
                          className="font-semibold text-slate-900 transition hover:text-emerald-700"
                        >
                          {purchase.referenceNumber}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            purchase.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {purchase.supplier.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          {purchase.items.length}{" "}
                          {purchase.items.length === 1
                            ? "item"
                            : "items"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {purchase.currency}{" "}
                          {Number(
                            purchase.totalAmount,
                          ).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            purchase.paymentStatus ===
                            "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {purchase.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isDraft
                              ? "bg-slate-100 text-slate-600"
                              : isOrdered
                                ? "bg-amber-50 text-amber-700"
                                : isReceived
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isCancelled
                                    ? "bg-red-50 text-red-600"
                                    : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDraft
                                ? "bg-slate-400"
                                : isOrdered
                                  ? "bg-amber-500"
                                  : isReceived
                                    ? "bg-emerald-500"
                                    : isCancelled
                                      ? "bg-red-500"
                                      : "bg-slate-400"
                            }`}
                          />

                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex min-w-[150px] flex-col items-start gap-2">
                          <Link
                            href={`/purchases/${purchase.id}`}
                            className="text-xs font-semibold text-slate-600 transition hover:text-slate-950"
                          >
                            View details →
                          </Link>

                          {isDraft && (
                            <>
                              <OrderPurchaseButton
                                purchaseId={
                                  purchase.id
                                }
                              />

                              <CancelPurchaseButton
                                purchaseId={
                                  purchase.id
                                }
                              />
                            </>
                          )}

                          {isOrdered && (
                            <>
                              <ReceivePurchaseButton
                                purchaseId={
                                  purchase.id
                                }
                              />

                              <CancelPurchaseButton
                                purchaseId={
                                  purchase.id
                                }
                              />
                            </>
                          )}

                          {isReceived && (
                            <span className="text-xs font-medium text-emerald-600">
                              Completed
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs font-medium text-slate-400">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Operational note */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Purchasing connects directly to inventory
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              When an ordered purchase is received, the
              incoming stock can be reflected in your
              inventory workflow.
            </p>
          </div>

          <Link
            href="/inventory"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Open inventory →
          </Link>
        </div>
      </section>
    </div>
  );
}