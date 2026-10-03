import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Purchasing and Supplier Management Software",
  description:
    "Manage purchases, suppliers, products, and inventory-related purchasing activity from one connected SmatPic workspace.",
  alternates: {
    canonical: "/purchasing-management",
  },
  openGraph: {
    title: "Purchasing and Supplier Management Software | SmatPic",
    description:
      "Manage purchases, suppliers, products, and inventory-related purchasing activity from one connected SmatPic workspace.",
    url: "https://www.smatpic.com/purchasing-management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Purchasing and Supplier Management Software | SmatPic",
    description:
      "Manage purchases, suppliers, products, and inventory-related purchasing activity from one connected SmatPic workspace.",
  },
};

const capabilities = [
  {
    title: "Supplier management",
    description:
      "Keep supplier information available alongside the purchasing activity and products associated with your business.",
  },
  {
    title: "Purchase management",
    description:
      "Record and manage purchases as part of your everyday business operations.",
  },
  {
    title: "Product purchasing",
    description:
      "Keep purchased products connected to the product and inventory information used by your business.",
  },
  {
    title: "Connected inventory",
    description:
      "Connect purchasing activity with inventory operations so stock-related work is not isolated from purchasing.",
  },
];

export default function PurchasingManagementPage() {
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
              Purchasing and suppliers
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Manage purchasing and suppliers in one connected workspace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic connects suppliers, purchases, products, and inventory
              operations so your team can manage purchasing as part of the
              wider business workflow.
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
              Keep purchasing connected to what your business needs
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Purchasing affects products and stock, while supplier information
              supports the decisions and records behind those purchases.
              SmatPic keeps these operational areas together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
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
                From supplier to stock
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Purchasing is part of the inventory lifecycle. SmatPic helps
                keep supplier and purchase information connected with the
                products and stock operations that follow.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Purchasing operations in one workspace
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Manage supplier information.</li>
                <li>• Record and manage purchases.</li>
                <li>• Connect purchases with products.</li>
                <li>• Keep purchasing connected with inventory.</li>
                <li>• Maintain purchasing information alongside other operations.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bring purchasing into your business workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Manage suppliers and purchases from the same connected workspace
            that supports your inventory and day-to-day operations.
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
