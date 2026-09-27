import {
  BarChart3,
  Boxes,
  CreditCard,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import {
  getBusinessReportAction,
  getPharmacyBatchMovementReportAction,
  getPharmacyBatchStockValuationAction,
  getPharmacyControlledDispensingRegisterAction,
  getPharmacyExpiryReportAction,
  getPharmacyPrescriptionDispensingReportAction,
  getPharmacyRecallReportAction,
} from "@/lib/reports/actions";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";


export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const business =
    await getCurrentBusiness();

  const report =
    await getBusinessReportAction();

  const controlledDispensingRegister =
    business.type === "pharmacy"
      ? await getPharmacyControlledDispensingRegisterAction()
      : [];
	  
    const prescriptionDispensingReport =
    business.type === "pharmacy"
      ? await getPharmacyPrescriptionDispensingReportAction()
      : [];
	  
	  const pharmacyExpiryReport =
    business.type === "pharmacy"
      ? await getPharmacyExpiryReportAction()
      : [];
	  
	const pharmacyBatchMovementReport =
  business.type === "pharmacy"
    ? await getPharmacyBatchMovementReportAction()
    : [];
	
	const pharmacyBatchStockValuation =
  business.type === "pharmacy"
    ? await getPharmacyBatchStockValuationAction()
    : {
        rows: [],
        totalStockValue: 0,
        totalUnits: 0,
      };
	  
	const pharmacyRecallReport =
  business.type === "pharmacy"
    ? await getPharmacyRecallReportAction()
    : [];

return ( <div className="space-y-6">
{/* Reports hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            Reports
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
            Business overview
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Reports & insights
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Understand how your business is performing across
          revenue, purchases, expenses and inventory.
        </p>
      </div>

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
        <BarChart3 className="h-6 w-6" />
      </div>
    </div>
  </section>

  {/* Business performance overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Business performance
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        Performance overview
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        A consolidated view of revenue, purchasing,
        expenses and estimated profitability.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ReportCard
        label="Revenue"
        value={report.sales.amount}
        description={`${report.sales.count} completed sales`}
        icon={
          <TrendingUp className="h-5 w-5" />
        }
        borderTone="border-emerald-200"
        iconTone="text-emerald-700"
        valueTone="text-emerald-900"
      />

      <ReportCard
        label="Purchases"
        value={report.purchases.amount}
        description={`${report.purchases.count} received purchases`}
        icon={
          <ReceiptText className="h-5 w-5" />
        }
        borderTone="border-blue-200"
        iconTone="text-blue-700"
        valueTone="text-blue-900"
      />

      <ReportCard
        label="Expenses"
        value={report.expenses.amount}
        description={`${report.expenses.count} expenses recorded`}
        icon={
          <CreditCard className="h-5 w-5" />
        }
        borderTone="border-amber-200"
        iconTone="text-amber-700"
        valueTone="text-amber-900"
      />

      <ReportCard
        label="Profit estimate"
        value={report.profit}
        description="Revenue minus purchases and expenses"
        icon={
          <BarChart3 className="h-5 w-5" />
        }
        borderTone="border-violet-200"
        iconTone="text-violet-700"
        valueTone="text-violet-900"
      />
    </div>
  </section>

  {/* Operational performance */}
  <section className="grid gap-6 lg:grid-cols-2">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Sales performance
            </p>

            <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
              Revenue performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revenue generated by completed sales.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Total revenue
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {report.sales.amount.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {report.sales.count.toLocaleString()} completed sales
          </p>
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
            <Boxes className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Inventory
            </p>

            <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
              Inventory position
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current stock across your business.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Units
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {report.inventory.units.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Available inventory units
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Stock value
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {report.inventory.value.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Current inventory valuation
          </p>
        </div>
      </div>
    </div>
  </section>
  
    {/* Tax summary */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-cyan-700">
          <ReceiptText className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Tax reporting
          </p>

          <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
            Tax & VAT summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tax collected from completed sales.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
      <SummaryItem
        label="Taxable sales"
        value={report.tax.taxableSales}
      />

      <SummaryItem
        label="Tax collected"
        value={report.tax.taxCollected}
      />

      <SummaryItem
        label="Total sales"
        value={report.tax.totalSales}
      />
    </div>
  </section>

  {/* Financial summary */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Financial summary
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
          Estimated business performance
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          A consolidated view of your current operational data.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
        <p className="text-xs text-slate-400">
          Estimated profit
        </p>

        <p className="mt-1 text-2xl font-semibold">
          {report.profit.toLocaleString()}
        </p>
      </div>
    </div>

    <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
      <SummaryItem
        label="Revenue"
        value={report.sales.amount}
      />

      <SummaryItem
        label="Purchases"
        value={report.purchases.amount}
      />

      <SummaryItem
        label="Expenses"
        value={report.expenses.amount}
      />
    </div>
  </section>
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pharmacy compliance
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            Controlled Medicine Register
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Controlled medicine dispensing activity, batch traceability,
            prescription and pharmacist records.
          </p>
        </div>
      </div>

      {controlledDispensingRegister.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No controlled medicine dispensing records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Register</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Sale</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Medicine</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Batch</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Expiry</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Qty</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Prescription</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Pharmacist</th>
                <th className="px-4 py-3 font-semibold text-slate-600">License</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {controlledDispensingRegister.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {record.registerReference ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.saleReference}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.dispensedAt.toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {record.productName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.sku ?? "No SKU"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.batchNumber}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.expiryDate.toLocaleDateString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {record.quantity.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {record.prescriptionNumber ?? "—"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.prescriberName ?? "No prescriber"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.customerName ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.pharmacistName ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.pharmacistLicense ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        record.status === "DISPENSED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pharmacy compliance
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            Prescription Dispensing Report
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Prescription quantities, dispensing progress, prescriber,
            customer and sale information.
          </p>
        </div>
      </div>

      {prescriptionDispensingReport.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No prescription dispensing records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Prescription
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Customer
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Prescriber
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Prescribed
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Dispensed
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Remaining
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Sale
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {prescriptionDispensingReport.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {record.prescriptionNumber}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.expiryDate
                        ? `Expires ${record.expiryDate.toLocaleDateString()}`
                        : "No expiry"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.prescriptionDate.toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {record.productName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.sku ?? "No SKU"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.customerName ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {record.prescriberName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.prescriberLicense ?? "No license"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {record.quantityPrescribed.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-emerald-700">
                    {record.quantityDispensed.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-amber-700">
                    {record.quantityRemaining.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {record.saleReference ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pharmacy inventory
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            Batch Expiry Report
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Batch-level expiry dates, remaining stock, supplier,
            warehouse and stock valuation.
          </p>
        </div>
      </div>

      {pharmacyExpiryReport.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No pharmacy batch expiry records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Batch
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Manufacturing
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Expiry
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Days
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Remaining
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Unit Cost
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Stock Value
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Warehouse
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Supplier
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pharmacyExpiryReport.map((batch) => {
                const expiryTone =
                  batch.daysToExpiry < 0
                    ? "bg-red-50 text-red-700"
                    : batch.daysToExpiry <= 30
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700";

                const expiryLabel =
                  batch.daysToExpiry < 0
                    ? "EXPIRED"
                    : batch.daysToExpiry <= 30
                      ? "EXPIRING SOON"
                      : "ACTIVE";

                return (
                  <tr
                    key={batch.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950">
                        {batch.productName}
                      </div>

                      <div className="text-xs text-slate-400">
                        {batch.sku ?? "No SKU"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {batch.batchNumber}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {batch.manufacturingDate
                        ? batch.manufacturingDate.toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                      {batch.expiryDate.toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${expiryTone}`}
                      >
                        {batch.daysToExpiry < 0
                          ? `${Math.abs(batch.daysToExpiry)} days overdue`
                          : `${batch.daysToExpiry} days`}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                      {batch.quantityRemaining.toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {batch.unitCost.toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                      {batch.stockValue.toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {batch.warehouseName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {batch.supplierName ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${expiryTone}`}
                      >
                        {batch.isRecalled
                          ? "RECALLED"
                          : expiryLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pharmacy inventory
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            Batch Movement Report
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pharmacy batch adjustments, quantities, costs, references and
            audit information.
          </p>
        </div>
      </div>

      {pharmacyBatchMovementReport.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No pharmacy batch movement records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1300px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Warehouse
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Movement
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Quantity
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Unit Cost
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Total Cost
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Reference
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Created By
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Notes
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pharmacyBatchMovementReport.map((movement) => (
                <tr
                  key={movement.id}
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {movement.createdAt.toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {movement.productName}
                    </div>

                    <div className="text-xs text-slate-400">
                      {movement.sku ?? "No SKU"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {movement.warehouseName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {movement.movementType}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {movement.quantity.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {movement.unitCost?.toLocaleString() ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {movement.totalCost?.toLocaleString() ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {movement.referenceId ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {movement.createdBy}
                  </td>

                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    {movement.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Pharmacy inventory
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Stock Valuation by Batch
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Current pharmacy inventory value calculated from remaining
              batch quantities and batch unit costs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Stock value
              </p>

              <p className="mt-1 text-xl font-semibold">
                {pharmacyBatchStockValuation.totalStockValue.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Units
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-950">
                {pharmacyBatchStockValuation.totalUnits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pharmacyBatchStockValuation.rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No pharmacy stock valuation records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1250px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Batch
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Expiry
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Remaining
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Unit Cost
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Stock Value
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Warehouse
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Supplier
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pharmacyBatchStockValuation.rows.map((batch) => (
                <tr
                  key={batch.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {batch.productName}
                    </div>

                    <div className="text-xs text-slate-400">
                      {batch.sku ?? "No SKU"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.batchNumber}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.expiryDate.toLocaleDateString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {batch.quantityRemaining.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.unitCost.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                    {batch.stockValue.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.warehouseName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.supplierName ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        batch.isRecalled
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      {batch.isRecalled ? "RECALLED" : "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
    {business.type === "pharmacy" && (
    <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
      <div className="border-b border-red-100 bg-red-50/50 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">
            Pharmacy safety
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            Batch Recall Report
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Recalled medicines, affected batches, remaining quantities,
            suppliers and recall reasons.
          </p>
        </div>
      </div>

      {pharmacyRecallReport.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No recalled pharmacy batches found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Batch
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Manufacturing
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Expiry
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Received
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Remaining
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Stock Value
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Warehouse
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Supplier
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Recall Reason
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Recalled
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pharmacyRecallReport.map((batch) => (
                <tr
                  key={batch.id}
                  className="bg-red-50/20 hover:bg-red-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {batch.productName}
                    </div>

                    <div className="text-xs text-slate-400">
                      {batch.sku ?? "No SKU"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-red-700">
                    {batch.batchNumber}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.manufacturingDate
                      ? batch.manufacturingDate.toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.expiryDate.toLocaleDateString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.quantityReceived.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {batch.quantityRemaining.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                    {batch.stockValue.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.warehouseName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.supplierName ?? "—"}
                  </td>

                  <td className="max-w-sm px-4 py-3 text-slate-600">
                    {batch.recallReason ?? "No reason recorded"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {batch.recalledAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )}
  
</div>


);
}

function ReportCard({
label,
value,
description,
icon,
borderTone = "border-slate-200",
iconTone = "text-violet-700",
valueTone = "text-slate-950",
}: {
label: string;
value: number;
description: string;
icon: React.ReactNode;
borderTone?: string;
iconTone?: string;
valueTone?: string;
}) {
return (
<div
className={[
"rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
borderTone,
].join(" ")}
> <div className="flex items-start justify-between gap-4"> <div> <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
{label} </p>


      <p
        className={[
          "mt-3 text-3xl font-semibold tracking-tight",
          valueTone,
        ].join(" ")}
      >
        {value.toLocaleString()}
      </p>
    </div>

    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50",
        iconTone,
      ].join(" ")}
    >
      {icon}
    </div>
  </div>

  <p className="mt-4 text-xs leading-5 text-slate-500">
    {description}
  </p>
</div>


);
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
        {value.toLocaleString()}
      </p>
    </div>
  );
}