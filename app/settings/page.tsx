import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  <Link
    href="/settings/currency"
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
  >
    <h2 className="font-semibold text-slate-900">
      Currency
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      Configure your business currency settings.
    </p>
  </Link>

  <Link
    href="/settings/users"
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
  >
    <h2 className="font-semibold text-slate-900">
      Users & Access
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      Manage users, roles, and access for this business.
    </p>
  </Link>
</section>
    </div>
  );
}