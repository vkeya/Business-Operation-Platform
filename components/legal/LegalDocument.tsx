import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Scale,
  Cookie,
  CreditCard,
  Server,
} from "lucide-react";

type LegalDocumentProps = {
  title: string;
  description: string;
  version?: string;
  effectiveDate?: string;
  icon?: "file" | "shield" | "scale" | "cookie" | "payment" | "server";
  children: React.ReactNode;
};

const icons = {
  file: FileText,
  shield: ShieldCheck,
  scale: Scale,
  cookie: Cookie,
  payment: CreditCard,
  server: Server,
};

export default function LegalDocument({
  title,
  description,
  version = "Version 1.0",
  effectiveDate = "Effective date: To be confirmed",
  icon = "file",
  children,
}: LegalDocumentProps) {
  const Icon = icons[icon];

  return (
    <div className="space-y-6">
      {/* Document hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-8 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Legal & Privacy
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                <Icon className="h-3.5 w-3.5" />
                SmatPic Legal
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                {description}
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold text-white">
                {version}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {effectiveDate}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Document body */}
      <article className="rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="space-y-10 text-[15px] leading-7 text-slate-600">
            {children}
          </div>
        </div>
      </article>

      {/* Footer navigation */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            SmatPic Legal & Privacy
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Review the other policies and agreements governing the platform.
          </p>
        </div>

        <Link
          href="/legal"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View all legal documents
        </Link>
      </div>
    </div>
  );
}