"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  getBusinessNavigation,
} from "@/lib/navigation/businessNavigation";
import {
  appNavigation,
  type NavigationItem,
} from "@/lib/navigation/appNavigation";
import {
  translations,
  type TranslationSet,
} from "@/lib/i18n/translations";
import LogoutButton from "@/components/auth/LogoutButton";
import type {
  BusinessType,
} from "@/types";

interface MobileNavProps {
  translations?: TranslationSet;
  businessType?: string;
}

export default function MobileNav({
  translations: t = translations.en,
  businessType,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const navigationItems: NavigationItem[] =
    businessType
      ? getBusinessNavigation(
          businessType as BusinessType,
        )
      : appNavigation;

  return (
    <div className="relative z-40 lg:hidden">
      <header className="flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl">
        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
            T
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">
              Teketeke
            </p>

            <p className="eyebrow mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t.common.businessOperatingSystem}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setIsOpen((current) => !current)
          }
          aria-label={
            isOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 top-[72px] bg-slate-950/20 backdrop-blur-[1px]"
          />

          <nav className="absolute inset-x-0 top-[72px] border-b border-slate-200/70 bg-white/95 px-4 py-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
            <p className="eyebrow mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {t.navigation.workspace}
            </p>

            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                >
                  <span>
                    {
                      t.navigation[
                        item.labelKey
                      ]
                    }
                  </span>

                  <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <LogoutButton
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="pointer-events-none absolute opacity-0">
                <LogOut />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-4 text-white">
              <p className="eyebrow text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">
                Teketeke
              </p>

              <p className="mt-2 text-sm font-semibold">
                Your business workspace
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Business operations, simplified.
              </p>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}