"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, BookOpen, X } from "lucide-react";
import type { SupportArticle } from "@/lib/support/supportContent";

interface SupportSearchProps {
  articles: SupportArticle[];
}

export default function SupportSearch({
  articles,
}: SupportSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");

    if (category && articles.some((article) => article.category === category)) {
      setSelectedCategory(category);
    }
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        !selectedCategory || article.category === selectedCategory;

      const matchesSearch =
        !term ||
        [
          article.title,
          article.category,
          article.excerpt,
          article.introduction,
          ...article.steps.map(
            (step) => `${step.title} ${step.description}`,
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [articles, query, selectedCategory]);

  return (
    <section id="help-articles" className="scroll-mt-8">
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for help, e.g. create a business..."
          aria-label="Search support articles"
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Help library
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            {selectedCategory || (query ? "Search results" : "Popular help articles")}
          </h2>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                window.history.replaceState(
                  null,
                  "",
                  `${window.location.pathname}#help-articles`,
                );
              }}
              className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-900"
            >
              Clear category filter
            </button>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {filteredArticles.length}{" "}
          {filteredArticles.length === 1 ? "article" : "articles"}
        </span>
      </div>

      {filteredArticles.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/support/${article.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
              </div>

              <p className="mt-4 text-xs font-semibold text-violet-600">
                {article.category}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {article.excerpt}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                {article.readingTime}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Search className="mx-auto h-7 w-7 text-slate-300" />
          <h3 className="mt-3 font-semibold text-slate-900">
            No matching articles found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try another search term or contact the SmatPic support team.
          </p>
          <a
            href="mailto:info@smatpic.com"
            className="mt-4 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            Email support
          </a>
        </div>
      )}
    </section>
  );
}
