import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import { getSupplierIntelligence } from "@/lib/intelligence/supplierIntelligenceService";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function SupplierIntelligencePage() {
  const context = await getCurrentBusinessContext();
  const intelligence = await getSupplierIntelligence(
    context.business.id,
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Supplier Intelligence
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Professional supplier spend, concentration and
          purchasing performance intelligence.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active suppliers"
          value={formatNumber(
            intelligence.activeSupplierCount,
          )}
        />
        <MetricCard
          label="New suppliers"
          value={formatNumber(
            intelligence.newSupplierCount,
          )}
        />
        <MetricCard
          label="Avg. payment terms"
          value={
            intelligence.averagePaymentTermsDays === null
              ? "—"
              : `${intelligence.averagePaymentTermsDays.toFixed(
                  1,
                )} days`
          }
        />
        <MetricCard
          label="Unpaid / partial received"
          value={formatNumber(
            intelligence.partiallyOrUnpaidReceivedPurchases,
          )}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Supplier spend by currency
          </h2>
          <p className="text-sm text-muted-foreground">
            Current 30 days versus the preceding 30 days.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="p-3">Currency</th>
                <th className="p-3">Current spend</th>
                <th className="p-3">Previous spend</th>
                <th className="p-3">Change</th>
                <th className="p-3">Purchases</th>
                <th className="p-3">Avg. purchase</th>
              </tr>
            </thead>
            <tbody>
              {intelligence.purchaseCountByCurrency.map(
                (item) => (
                  <tr
                    key={item.currency}
                    className="border-b last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {item.currency}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        item.currentSpend,
                        item.currency,
                      )}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        item.previousSpend,
                        item.currency,
                      )}
                    </td>
                    <td className="p-3">
                      {formatPercent(
                        item.spendChangePercent,
                      )}
                    </td>
                    <td className="p-3">
                      {formatNumber(item.purchaseCount)}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        item.averagePurchaseValue,
                        item.currency,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Top suppliers
          </h2>
          <p className="text-sm text-muted-foreground">
            Supplier concentration is shown independently
            for each currency.
          </p>
        </div>

        {Object.entries(
          intelligence.topSuppliersByCurrency,
        ).map(([currency, suppliers]) => (
          <div
            key={currency}
            className="overflow-x-auto rounded-lg border"
          >
            <div className="border-b px-4 py-3 font-medium">
              {currency}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Spend</th>
                  <th className="p-3">Share</th>
                  <th className="p-3">Purchases</th>
                  <th className="p-3">
                    Avg. purchase
                  </th>
                  <th className="p-3">
                    Payment terms
                  </th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr
                    key={`${currency}:${supplier.supplierId}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {supplier.supplierName}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        supplier.spend,
                        currency,
                      )}
                    </td>
                    <td className="p-3">
                      {supplier.shareOfCurrencySpend.toFixed(
                        1,
                      )}
                      %
                    </td>
                    <td className="p-3">
                      {formatNumber(
                        supplier.purchaseCount,
                      )}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        supplier.averagePurchaseValue,
                        currency,
                      )}
                    </td>
                    <td className="p-3">
                      {supplier.paymentTermsDays === null
                        ? "—"
                        : `${supplier.paymentTermsDays} days`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {intelligence.concentrationByCurrency.map(
          (item) => (
            <div
              key={item.currency}
              className="rounded-lg border p-4"
            >
              <h2 className="font-semibold">
                Concentration — {item.currency}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.topSupplierName
                  ? `${item.topSupplierName} represents ${item.topSupplierSharePercent.toFixed(
                      1,
                    )}% of current supplier spend in ${item.currency}.`
                  : "No supplier spend recorded in this currency."}
              </p>
            </div>
          ),
        )}
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="font-semibold">
          Data quality
        </h2>
        <p className="text-sm text-muted-foreground">
          {intelligence.dataQuality.receivedPurchases} received
          purchases were analysed.{" "}
          {intelligence.dataQuality.supplierCurrencyMismatchCount}{" "}
          have a supplier default currency that differs from
          the purchase currency. This is a review signal, not
          an automatic error.
        </p>
      </section>

      <section className="rounded-lg border bg-muted/20 p-4">
        <h2 className="font-semibold">Methodology</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Only RECEIVED purchases are included.
          </li>
          <li>
            Current 30 days are compared with the preceding
            30 days.
          </li>
          <li>
            Spend uses Purchase.totalAmount.
          </li>
          <li>
            Currency totals are never combined.
          </li>
          <li>
            The payment exposure signal identifies received
            purchases that are not marked PAID; it is not a
            cross-currency payable balance.
          </li>
        </ul>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}
