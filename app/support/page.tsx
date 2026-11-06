import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
} from "lucide-react";
import SupportSearch from "./search/SupportSearch";
import SupportShell from "@/components/support/SupportShell";
import {
  supportArticles,
  supportCategories,
} from "@/lib/support/supportContent";

export const metadata: Metadata = {
  title: "Help & Support Centre",
  description:
    "Find answers, step-by-step guides and support for using the SmatPic business operations platform.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportPage() {
  return (
    <SupportShell>
      <main className="min-h-screen bg-slate-50">

      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-violet-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            SmatPic Customer Support
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            How can we help you?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Find answers, follow step-by-step guides and get help with setting
            up and managing your business on SmatPic.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <a
              href="#help-articles"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
            >
              <Search className="h-4 w-4" />
              Explore help articles
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-300" />
              Step-by-step guides
            </span>
            <span className="inline-flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-300" />
              Searchable help
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-violet-300" />
              Direct support
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Browse by topic
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              What do you need help with?
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {supportCategories.map((category) => {
              const Icon =
                category.icon === "rocket" ? Rocket : Building2;

              const count = supportArticles.filter(
                (article) => article.category === category.name,
              ).length;

              return (
                <a
                  key={category.name}
                  href={`?category=${encodeURIComponent(category.name)}#help-articles`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {category.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-violet-700">
                      {count} {count === 1 ? "guide" : "guides"}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </a>
              );
            })}
          </div>
        </section>

        <div className="mt-12">
          <SupportSearch articles={supportArticles} />
        </div>

        <section id="contact" className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 to-violet-950 p-7 text-white sm:p-9">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                Need more help?
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Talk to the SmatPic support team
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                If you cannot find the answer in our help library, contact
                our team. Include a description of the issue and the steps
                you took so we can assist you more effectively.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <a
                href="mailto:info@smatpic.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-violet-50"
              >
                <Mail className="h-4 w-4" />
                Email support
              </a>
              <a
                href="tel:+254722534317"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Call support
              </a>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="mailto:info@smatpic.com"
              className="hover:text-white"
            >
              info@smatpic.com
            </a>
            <a
              href="tel:+254722534317"
              className="hover:text-white"
            >
              +254 722 534 317
            </a>
          </div>
        </section>
      </div>

    </main>
    </SupportShell>
  );
}
