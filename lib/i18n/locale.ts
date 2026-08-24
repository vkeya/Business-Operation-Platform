import { cookies } from "next/headers";
import {
  defaultLocale,
  type Locale,
} from "./config";
import { isSupportedLocale } from "./index";

export const LOCALE_COOKIE =
  "teketeke-locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  const value =
    cookieStore.get(
      LOCALE_COOKIE,
    )?.value;

  if (
    value &&
    isSupportedLocale(value)
  ) {
    return value;
  }

  return defaultLocale;
}