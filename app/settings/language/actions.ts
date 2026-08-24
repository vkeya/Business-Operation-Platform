"use server";

import { cookies } from "next/headers";
import { defaultLocale } from "@/lib/i18n/config";
import { isSupportedLocale } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

export async function setLocaleAction(
  locale: string,
) {
  const cookieStore = await cookies();

  const nextLocale =
    isSupportedLocale(locale)
      ? locale
      : defaultLocale;

  cookieStore.set(
    LOCALE_COOKIE,
    nextLocale,
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  );
}