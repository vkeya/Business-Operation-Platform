import Link from "next/link";
import CustomerForm from "../CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/customers"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Customers
        </Link>

        <p className="mt-6 text-sm font-medium text-slate-500">
          Customers / New
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Add customer
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create a customer record and keep future sales connected
          to them.
        </p>
      </div>

      <CustomerForm mode="create" />
    </div>
  );
}