import {
  defaultLocale,
  type Locale,
} from "./config";

import {
  translations,
  type TranslationSet,
} from "./translations";

export type { TranslationSet };

export function getTranslations(
  locale: Locale = defaultLocale,
): TranslationSet {
  return translations[locale];
}

export function isSupportedLocale(
  value: string,
): value is Locale {
  return Object.prototype.hasOwnProperty.call(
    translations,
    value,
  );
}