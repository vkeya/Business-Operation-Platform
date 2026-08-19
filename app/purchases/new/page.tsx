import PurchaseForm from "./PurchaseForm";
import { getPurchaseDefaultsAction } from "../action";

export default async function NewPurchasePage() {
  const defaults =
    await getPurchaseDefaultsAction();

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Purchasing
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Record purchase
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create a purchase draft for products coming into your business.
        </p>
      </div>

      <PurchaseForm
        suppliers={defaults.suppliers}
        products={defaults.products}
        warehouses={defaults.warehouses}
        currency={defaults.currency}
      />
    </div>
  );
}