import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inventory Management Software for Growing Businesses",
  description:
    "Track products, stock levels, and stock movement with connected inventory management in SmatPic.",
  alternates: {
    canonical: "/inventory-management",
  },
  openGraph: {
    title: "Inventory Management Software for Growing Businesses | SmatPic",
    description:
      "Track products, stock levels, and stock movement with connected inventory management in SmatPic.",
    url: "https://www.smatpic.com/inventory-management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inventory Management Software for Growing Businesses | SmatPic",
    description:
      "Track products, stock levels, and stock movement with connected inventory management in SmatPic.",
  },
};

const capabilities = [
  {
    title: "Product and stock visibility",
    description:
      "Keep product information and stock levels in one connected workspace so your team can see what is available.",
  },
  {
    title: "Stock movement",
    description:
      "Track inventory movement as products move through your day-to-day business operations.",
  },
  {
    title: "Connected sales",
    description:
      "Keep inventory connected to sales so stock information stays part of the same operating workflow.",
  },
  {
    title: "Connected purchasing",
    description:
      "Manage purchasing and suppliers alongside inventory instead of maintaining separate operational records.",
  },
];

export default function InventoryManagementPage() {
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
              Inventory management
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Know what you have, what is moving, and what your business needs.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic connects products, stock movement, sales, and purchasing
              in one workspace so your team can manage inventory as part of
              everyday business operations.
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
              Inventory that works with the rest of your business
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Inventory is more useful when it is connected to the operations
              that change it. SmatPic brings stock, sales, and purchasing into
              the same business workspace.
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
                From stock records to connected operations
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                When a sale happens, inventory is part of the same workflow.
                When you purchase products, purchasing and stock management
                stay connected. This gives your team a clearer operational
                picture without relying on disconnected records.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Built for everyday inventory work
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Manage products and stock information.</li>
                <li>• Track stock movement through business operations.</li>
                <li>• Connect inventory with sales activity.</li>
                <li>• Connect inventory with purchasing and suppliers.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Build a clearer view of your inventory
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Bring inventory into the same workspace you use to run sales and
            purchasing with SmatPic.
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
