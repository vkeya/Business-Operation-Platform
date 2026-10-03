import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Supermarket Management Software for Growing Stores",
  description:
    "Manage supermarket sales, POS, inventory, products, purchasing, suppliers, payments, and daily operations with SmatPic.",
  alternates: {
    canonical: "/solutions/supermarket",
  },
  openGraph: {
    title: "Supermarket Management Software for Growing Stores | SmatPic",
    description:
      "Manage supermarket sales, POS, inventory, products, purchasing, suppliers, payments, and daily operations with SmatPic.",
    url: "https://www.smatpic.com/solutions/supermarket",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supermarket Management Software for Growing Stores | SmatPic",
    description:
      "Manage supermarket sales, POS, inventory, products, purchasing, suppliers, payments, and daily operations with SmatPic.",
  },
};

const capabilities = [
  {
    title: "Point of sale",
    description:
      "Process supermarket transactions with product search, barcode scanning, payments, inventory updates, and receipts.",
  },
  {
    title: "Inventory management",
    description:
      "Manage products and stock information while keeping inventory connected to everyday supermarket sales.",
  },
  {
    title: "Purchasing and suppliers",
    description:
      "Manage purchases and supplier information alongside the products and inventory operations they support.",
  },
  {
    title: "Sales and payments",
    description:
      "Keep sales activity and payment information connected within the same business operations workspace.",
  },
  {
    title: "Product management",
    description:
      "Maintain product information as part of the connected supermarket operations workflow.",
  },
  {
    title: "Business operations",
    description:
      "Bring supermarket sales, inventory, purchasing, payments, and other supported business activities into one workspace.",
  },
];

export default function SupermarketSolutionPage() {
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
              SmatPic for supermarkets
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Supermarket management software for connected daily operations.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic brings supermarket POS, sales, products, inventory,
              purchasing, suppliers, payments, and everyday business operations
              into one connected workspace.
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
              The supermarket workflow, connected
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Supermarket operations depend on the relationship between
              products, stock, sales, purchases, suppliers, and payments.
              SmatPic keeps these areas connected in one business workspace.
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
                From shelf stock to checkout
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                A supermarket needs sales and stock information to work
                together. SmatPic connects the checkout workflow with products
                and inventory, while purchasing and supplier activity supports
                the stock side of the business.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Built around supermarket operations
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Process sales through the POS workflow.</li>
                <li>• Search products and scan barcodes.</li>
                <li>• Keep sales connected with inventory updates.</li>
                <li>• Manage purchasing and supplier information.</li>
                <li>• Track payment activity and business operations.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Run your supermarket from one connected workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Bring sales, inventory, purchasing, payments, and everyday
            supermarket operations together with SmatPic.
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
