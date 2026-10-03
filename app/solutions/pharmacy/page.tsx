import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pharmacy Management Software for Growing Pharmacies",
  description:
    "Manage pharmacy products, medicines, prescriptions, batches, inventory, sales, and everyday pharmacy operations with SmatPic.",
  alternates: {
    canonical: "/solutions/pharmacy",
  },
  openGraph: {
    title: "Pharmacy Management Software for Growing Pharmacies | SmatPic",
    description:
      "Manage pharmacy products, medicines, prescriptions, batches, inventory, sales, and everyday pharmacy operations with SmatPic.",
    url: "https://www.smatpic.com/solutions/pharmacy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pharmacy Management Software for Growing Pharmacies | SmatPic",
    description:
      "Manage pharmacy products, medicines, prescriptions, batches, inventory, sales, and everyday pharmacy operations with SmatPic.",
  },
};

const capabilities = [
  {
    title: "Pharmacy products",
    description:
      "Manage pharmacy-specific product information alongside the wider product and inventory records used by your business.",
  },
  {
    title: "Medicine classification",
    description:
      "Support pharmacy products with medicine-type and prescription-type information as part of the pharmacy workflow.",
  },
  {
    title: "Batch management",
    description:
      "Keep batch information connected to pharmacy products and inventory operations.",
  },
  {
    title: "Connected sales",
    description:
      "Use the SmatPic sales and POS workflow while keeping pharmacy inventory connected to day-to-day transactions.",
  },
  {
    title: "Inventory management",
    description:
      "Track pharmacy stock within the connected inventory workspace instead of maintaining separate operational records.",
  },
  {
    title: "Business operations",
    description:
      "Connect pharmacy operations with purchasing, suppliers, payments, customers, and other business activities supported by SmatPic.",
  },
];

export default function PharmacySolutionPage() {
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
              SmatPic for pharmacies
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Pharmacy management software built around your daily operations.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic Pharmacy brings pharmacy products, medicine information,
              prescriptions, batches, inventory, sales, and business
              operations into one connected workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                Get started with SmatPic
              </Link>
              <Link
                href="/inventory-management"
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Explore inventory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Pharmacy-specific operations in one workspace
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Pharmacies need more than a basic product list. SmatPic Pharmacy
              adds pharmacy-specific product, medicine, prescription, and
              batch information to a connected business operations platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <article
                key={capability.title}
                className="rounded-2xl border border-slate-200 p-7"
              >
                <h3 className="text-xl font-semibold">{capability.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {capability.description}
                </p>
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
                Connect pharmacy stock with pharmacy sales
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Pharmacy operations span products, batches, inventory, and
                transactions. SmatPic keeps these areas connected so the
                pharmacy can manage daily work from the same operational
                workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Built for pharmacy operations
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Manage pharmacy-specific products.</li>
                <li>• Record medicine and prescription information.</li>
                <li>• Manage pharmacy product batches.</li>
                <li>• Connect pharmacy inventory with sales.</li>
                <li>• Keep pharmacy activity within the wider business workspace.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bring your pharmacy operations together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Manage pharmacy-specific operations alongside sales, inventory,
            purchasing, payments, and other business workflows in SmatPic.
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
