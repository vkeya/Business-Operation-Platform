import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SupportShell from "@/components/support/SupportShell";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
} from "lucide-react";
import {
  getSupportArticle,
  supportArticles,
} from "@/lib/support/supportContent";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return supportArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getSupportArticle(slug);

  if (!article) {
    return { title: "Help article not found" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/support/${article.slug}`,
    },
  };
}

export default async function SupportArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = getSupportArticle(slug);

  if (!article) notFound();

  return (
    <SupportShell>
      <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Centre
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50 to-white px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
              {article.category}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {article.introduction}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-500">
              <Clock3 className="h-4 w-4" />
              {article.readingTime}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-violet-600" />
              Follow these steps
            </div>

            <div className="mt-6 space-y-7">
              {article.steps.map((step, index) => (
                <section key={step.title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <h2 className="font-semibold text-slate-900">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </section>
              ))}
            </div>

            {article.tip && (
              <div className="mt-9 flex gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Helpful tip
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {article.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Still need help?
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Contact the SmatPic team if you need assistance with this process.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="mailto:info@smatpic.com"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              <Mail className="h-4 w-4" />
              info@smatpic.com
            </a>
            <a
              href="tel:+254722534317"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              <Phone className="h-4 w-4" />
              +254 722 534 317
            </a>
          </div>
        </section>

        <Link
          href="/support"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700"
        >
          Explore more help articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
    </SupportShell>
  );
}
