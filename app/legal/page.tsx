import Link from "next/link";
import {
  ArrowUpRight,
  Cookie,
  CreditCard,
  FileCheck2,
  FileText,
  Layers3,
  Scale,
  Server,
  ShieldCheck,
} from "lucide-react";

const documents = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    description:
      "The terms governing your use of the SmatPic Business Operations Platform.",
    action: "Read document",
    icon: FileText,
    iconLabel: "01",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    description:
      "How SmatPic collects, uses, protects, and handles personal data.",
    action: "Read document",
    icon: ShieldCheck,
    iconLabel: "02",
  },
  {
    href: "/legal/acceptable-use",
    title: "Acceptable Use Policy",
    description:
      "Rules and restrictions governing acceptable use of the platform.",
    action: "Read document",
    icon: FileCheck2,
    iconLabel: "03",
  },
  {
    href: "/legal/cookies",
    title: "Cookie Policy",
    description:
      "Information about cookies and similar technologies used by SmatPic.",
    action: "Read document",
    icon: Cookie,
    iconLabel: "04",
  },
  {
    href: "/legal/payments",
    title: "Payment, Subscription & Refund Policy",
    description:
      "Terms relating to payments, subscriptions, charges, and refunds.",
    action: "Read document",
    icon: CreditCard,
    iconLabel: "05",
  },
  {
    href: "/legal/service-level",
    title: "Service Availability Policy",
    description:
      "Information about platform availability, maintenance, and service interruptions.",
    action: "Read document",
    icon: Server,
    iconLabel: "06",
  },
  {
    href: "/legal/dpa",
    title: "Data Processing Agreement",
    description:
      "Terms governing processing of customer personal data by SmatPic.",
    action: "Read document",
    icon: Scale,
    iconLabel: "07",
  },
  {
    href: "/legal/subprocessors",
    title: "Subprocessors & Third-Party Services",
    description:
      "Information about third-party services that may process or support platform data.",
    action: "Read document",
    icon: Layers3,
    iconLabel: "08",
  },
];

export default function LegalPage() {
  return (
    <div className="space-y-6">
      {/* Legal hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Legal
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                Policies & agreements
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              SmatPic Legal Library
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Review the policies, terms, and agreements that govern your use
              of the SmatPic Business Operations Platform.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Legal documents */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Documents
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Policies & agreements
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select a document to review its current published terms.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((document) => {
            const Icon = document.icon;

            return (
              <Link
                key={document.href}
                href={document.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-slate-300">
                      {document.iconLabel}
                    </span>

                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-700" />
                  </div>
                </div>

                <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                  {document.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {document.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-700">
                  {document.action}

                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Document information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Document versions
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              Review the applicable version and effective date
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              These documents may be updated from time to time. The applicable
              version and effective date are identified within each document.
            </p>
          </div>

          <div className="sm:ml-auto">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
            >
              Privacy Center
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}