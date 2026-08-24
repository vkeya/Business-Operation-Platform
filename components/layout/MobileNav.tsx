"use client";

import Link from "next/link";
import { useState } from "react";
import { appNavigation } from "@/lib/navigation/appNavigation";
import { translations, type TranslationSet } from "@/lib/i18n/translations";

interface MobileNavProps {
  translations?: TranslationSet;
}

export default function MobileNav({
  translations: t = translations.en,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
        >
          <p className="text-sm font-semibold text-slate-900">
            {t.common.yourBusiness}
          </p>

          <p className="text-[11px] text-slate-500">
            {t.common.businessOperatingSystem}
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={
            isOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
        >
          <span className="text-lg">
            {isOpen ? "×" : "☰"}
          </span>
        </button>
      </header>

      {isOpen && (
        <nav className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="space-y-1">
            {appNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {t.navigation[item.labelKey]}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}