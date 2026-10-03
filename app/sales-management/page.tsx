import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sales and Payment Management Software",
  description:
    "Manage sales activity, payments, customers, and transaction information from one connected SmatPic workspace.",
  alternates: {
    canonical: "/sales-management",
  },
  openGraph: {
    title: "Sales and Payment Management Software | SmatPic",
    description:
      "Manage sales activity, payments, customers, and transaction information from one connected SmatPic workspace.",
    url: "https://www.smatpic.com/sales-management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales and Payment Management Software | SmatPic",
    description:
      "Manage sales activity, payments, customers, and transaction information from one connected SmatPic workspace.",
  },
};

const capabilities = [
  {
    title: "Sales activity",
    description:
      "Keep sales transactions in one workspace and maintain a clearer view of day-to-day sales activity.",
  },
  {
    title: "Payment tracking",
    description:
      "Keep payment activity connected to sales so transaction information stays together.",
  },
  {
    title: "Customer transactions",
    description:
      "Connect customer information with sales activity as part of your everyday business workflow.",
  },
  {
    title: "Connected inventory",
    description:
      "Sales can work alongside inventory so product and stock information remain part of the same operational workflow.",
  },
];

export default function SalesManagementPage() {
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
              Sales and payments
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Keep sales and payments connected to your business.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmatPic helps you manage sales activity, payments, customers, and
              related inventory information from one connected business
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
              Manage the transaction from sale to payment
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Sales and payments are connected parts of daily business
              operations. SmatPic keeps the information together so your team
              can work from the same operational picture.
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
                A connected sales workflow
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Process transactions through SmatPic while keeping payment,
                customer, and inventory information connected to the sale.
                This helps your business avoid treating each part of the
                transaction as a separate process.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold">
                Sales operations in one workspace
              </h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Record and manage sales transactions.</li>
                <li>• Track payment activity associated with sales.</li>
                <li>• Keep customer information connected to transactions.</li>
                <li>• Keep sales connected with inventory operations.</li>
                <li>• Use the POS workflow for day-to-day selling.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bring sales and payments into one workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Manage everyday transactions from the same connected workspace
            that supports the rest of your business operations.
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
