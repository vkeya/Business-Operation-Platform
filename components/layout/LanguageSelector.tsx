"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  localeLabels,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";
import { setLocaleAction } from "@/app/settings/language/actions";

interface LanguageSelectorProps {
  currentLocale: Locale;
}

export default function LanguageSelector({
  currentLocale,
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] =
    useTransition();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const locale = event.target.value as Locale;

    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });
  }

  return (
    <label className="flex items-center">
      <span className="sr-only">
        Language
      </span>

      <select
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-wait disabled:opacity-60"
      >
        {supportedLocales.map(
          (locale) => (
            <option
              key={locale}
              value={locale}
            >
              {localeLabels[locale]}
            </option>
          ),
        )}
      </select>
    </label>
  );
}