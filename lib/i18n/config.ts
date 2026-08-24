export const supportedLocales = [
  "en",
  "fr",
  "am",
] as const;

export type Locale =
  (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<
  Locale,
  string
> = {
  en: "English",
  fr: "Français",
  am: "አማርኛ",
};