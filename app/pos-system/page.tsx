import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Barcode,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Receipt,
  ShoppingCart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "POS System for Growing Businesses",
  description:
    "Run sales, barcode scanning, payments, inventory updates, and receipts from one connected SmatPic POS workspace.",
  alternates: {
    canonical: "/pos-system",
  },
  openGraph: {
    title: "POS System for Growing Businesses | SmatPic",
    description:
      "Run sales, barcode scanning, payments, inventory updates, and receipts from one connected SmatPic POS workspace.",
    url: "https://www.smatpic.com/pos-system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "POS System for Growing Businesses | SmatPic",
    description:
      "Run sales, barcode scanning, payments, inventory updates, and receipts from one connected SmatPic POS workspace.",
  },
};

const capabilities = [
  {
    icon: ShoppingCart,
    title: "Fast sales",
    description:
      "Search for products and process customer sales from a connected workspace.",
  },
  {
    icon: Barcode,
    title: "Barcode scanning",
    description:
      "Use barcode-based product workflows to make everyday selling faster and more consistent.",
  },
  {
    icon: CircleDollarSign,
    title: "Connected payments",
    description:
      "Record payments as part of the sales workflow instead of managing sales and payments separately.",
  },
  {
    icon: Boxes,
    title: "Inventory updates",
    description:
      "Connect sales activity with inventory so your stock position stays visible as you operate.",
  },
  {
    icon: Receipt,
    title: "Receipts",
    description:
      "Keep receipt generation connected to the completed sale.",
  },
];

const benefits = [
  "Bring sales and inventory into one connected workflow.",
  "Reduce the need to maintain separate sales and stock records.",
  "Give your team a consistent way to process customer purchases.",
  "Build your POS around the wider business operation rather than as a disconnected tool.",
];

export default function PosSystemPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight"
            aria-label="SmatPic home"
          >
            SmatPic
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-100 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cyan-100 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">
              SmatPic Point of Sale
            </p>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              A POS system connected to the rest of your business.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              Process sales, scan products, record payments, update inventory,
              and issue receipts from one connected SmatPic workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Start with SmatPic
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Explore SmatPic
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-700">
              More than a checkout screen
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Keep the sale connected to what happens next.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              A sale affects more than the till. It can affect inventory,
              payments, receipts, customer records, and the information you
              use to understand the business. SmatPic brings those operational
              activities into one connected platform.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;

              return (
                <article
                  key={capability.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-violet-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {capability.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {capability.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-700">
              Built for everyday operations
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Make selling part of your business system.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              SmatPic is designed for businesses that need their point of sale
              to work alongside inventory, purchasing, payments, teams, and
              wider business operations.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-300">
              What you get
            </p>

            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                  <span className="text-sm leading-6 text-slate-200">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-300">
            Get started
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to connect your sales operation?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Create your SmatPic account and build your business workspace
            around the operations you need today.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Create your workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
