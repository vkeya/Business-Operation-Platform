import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Retail and Shop Management Software",
  description:
    "Manage retail sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
  alternates: {
    canonical: "/solutions/retail",
  },
  openGraph: {
    title: "Retail and Shop Management Software | SmatPic",
    description:
      "Manage retail sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
    url: "https://www.smatpic.com/solutions/retail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail and Shop Management Software | SmatPic",
    description:
      "Manage retail sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
  },
};

const capabilities = [
  {
    title: "Retail POS",
    description:
      "Process customer sales with product search, barcode scanning, payments, inventory updates, and receipts.",
  },
  {
    title: "Product and inventory management",
    description:
      "Manage products and stock information while keeping inventory connected to retail sales.",
  },
  {
    title: "Purchasing and suppliers",
    description:
      "Manage purchases and supplier information alongside the products and stock they support.",
  },
  {
    title: "Sales and payments",
    description:
      "Keep sales activity and payment information connected within the same business operations workspace.",
  },
  {
    title: "Customer information",
    description:
      "Maintain customer information as part of your connected retail transactions and business operations.",
  },
  {
    title: "Business operations",
    description:
      "Bring retail sales, inventory, purchasing, payments, and other supported business activities into one workspace.",
  },
];

export default function RetailSolutionPage() {
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
              SmatPic for retail and shops
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Retail and shop management software for connected daily operations.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic connects retail POS, sales, products, inventory,
              purchasing, suppliers, payments, and customer information in one
              business workspace.
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
              Everything your shop needs to manage daily retail work
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Retail operations connect products, stock, sales, purchases,
              suppliers, customers, and payments. SmatPic brings these
              activities together instead of treating them as separate
              workflows.
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
                Connect your shop from stock to sale
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                A retail sale is connected to the products being sold, the
                inventory they affect, the payment received, and the customer
                transaction. SmatPic keeps these operational areas within the
                same workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Built around everyday retail operations
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Process retail sales through the POS workflow.</li>
                <li>• Search products and scan barcodes.</li>
                <li>• Keep sales connected with inventory updates.</li>
                <li>• Manage purchasing and supplier information.</li>
                <li>• Keep customer and payment information connected to operations.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Run your shop from one connected workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Bring retail sales, inventory, purchasing, payments, and everyday
            shop operations together with SmatPic.
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
