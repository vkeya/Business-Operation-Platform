import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Management Software for Growing Businesses",
  description:
    "Manage sales, inventory, purchasing, payments, customers, and everyday business operations from one connected SmatPic workspace.",
  alternates: {
    canonical: "/business-management-software",
  },
  openGraph: {
    title: "Business Management Software for Growing Businesses | SmatPic",
    description:
      "Manage sales, inventory, purchasing, payments, customers, and everyday business operations from one connected SmatPic workspace.",
    url: "https://www.smatpic.com/business-management-software",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Management Software for Growing Businesses | SmatPic",
    description:
      "Manage sales, inventory, purchasing, payments, customers, and everyday business operations from one connected SmatPic workspace.",
  },
};

const areas = [
  {
    title: "Sales",
    description:
      "Process sales and keep sales activity connected to the rest of your business operations.",
    href: "/pos-system",
  },
  {
    title: "Inventory",
    description:
      "Manage products, stock information, and stock movement from the same workspace.",
    href: "/inventory-management",
  },
  {
    title: "Purchasing",
    description:
      "Manage purchasing and supplier activity alongside the inventory and operations it affects.",
  },
  {
    title: "Payments",
    description:
      "Keep payment activity connected to sales and the financial movement of your business.",
  },
  {
    title: "Customers",
    description:
      "Maintain customer information as part of your connected business operations.",
  },
  {
    title: "Business insights",
    description:
      "Bring operational information together so you can understand what is happening across the business.",
  },
];

export default function BusinessManagementSoftwarePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            SmatPic
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-slate-600 transition hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Business management software
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Run more of your business from one connected workspace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic brings sales, inventory, purchasing, payments, customers,
              and business information together so you can manage everyday
              operations from one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                Get started with SmatPic
              </Link>
              <Link
                href="/pos-system"
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Explore POS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              One workspace for the work that keeps your business moving
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Instead of treating sales, stock, purchasing, and payments as
              separate activities, SmatPic connects them within your business
              operations.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <article
                key={area.title}
                className="rounded-2xl border border-slate-200 p-7"
              >
                <h3 className="text-xl font-semibold">{area.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {area.description}
                </p>
                {area.href ? (
                  <Link
                    href={area.href}
                    className="mt-5 inline-flex text-sm font-medium text-slate-950 underline underline-offset-4"
                  >
                    Learn more
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Keep your operations connected
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Business activity is connected. A sale can affect inventory and
                payments. Purchasing affects stock. Customer and product
                information supports everyday transactions. SmatPic brings
                these operational areas into one workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Designed around everyday business work
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Manage sales and point-of-sale activity.</li>
                <li>• Keep products and inventory information connected.</li>
                <li>• Manage purchasing and suppliers.</li>
                <li>• Track payments and business activity.</li>
                <li>• Keep customer information in your workspace.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bring your business operations together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Start with the operations your business needs today and manage
            them from a connected SmatPic workspace.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-lg bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Get started with SmatPic
          </Link>
        </div>
      </section>
    </main>
  );
}
