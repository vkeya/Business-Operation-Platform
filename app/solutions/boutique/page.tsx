import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutique Management Software for Fashion Shops",
  description:
    "Manage boutique sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
  alternates: {
    canonical: "/solutions/boutique",
  },
  openGraph: {
    title: "Boutique Management Software for Fashion Shops | SmatPic",
    description:
      "Manage boutique sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
    url: "https://www.smatpic.com/solutions/boutique",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boutique Management Software for Fashion Shops | SmatPic",
    description:
      "Manage boutique sales, POS, products, inventory, purchasing, suppliers, payments, and daily shop operations with SmatPic.",
  },
};

const capabilities = [
  {
    title: "Boutique POS",
    description:
      "Process customer purchases with product search, payments, inventory updates, and receipts through the SmatPic POS workflow.",
  },
  {
    title: "Product management",
    description:
      "Manage boutique products and keep product information connected to the sales and inventory operations that use it.",
  },
  {
    title: "Inventory management",
    description:
      "Track boutique stock and stock movement while keeping inventory connected with everyday sales activity.",
  },
  {
    title: "Purchasing and suppliers",
    description:
      "Manage purchases and supplier information alongside the products and inventory they support.",
  },
  {
    title: "Sales and payments",
    description:
      "Keep sales activity and payment information connected within the same business operations workspace.",
  },
  {
    title: "Connected business operations",
    description:
      "Bring boutique sales, inventory, purchasing, payments, and other supported business activities into one workspace.",
  },
];

export default function BoutiqueSolutionPage() {
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
              SmatPic for boutiques
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Boutique management software for connected fashion-shop operations.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic connects boutique POS, products, inventory, purchasing,
              suppliers, sales, payments, and everyday shop operations in one
              workspace.
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
              Manage your boutique from product to sale
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Boutique operations depend on knowing what products are
              available, what has sold, what needs to be purchased, and how
              sales and payments are recorded. SmatPic connects these
              activities in one business workspace.
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
                Keep boutique stock and sales connected
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                When a product is sold, inventory is part of the same
                transaction workflow. When new products are purchased,
                purchasing and inventory remain connected. SmatPic brings
                these operations together for the day-to-day running of your
                boutique.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Built around everyday boutique operations
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Process boutique sales through the POS workflow.</li>
                <li>• Manage products and boutique stock.</li>
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
            Run your boutique from one connected workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Bring products, sales, inventory, purchasing, payments, and daily
            boutique operations together with SmatPic.
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
