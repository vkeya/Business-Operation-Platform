import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { getLocale } from "@/lib/i18n/locale";
import {
  getTranslations,
} from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teketeke",
  description:
    "Business operations, tailored to your business.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const translationSet =
    getTranslations(locale);

  return (
    <html lang="en">
      <body>
        <AppShell
          currentLocale={locale}
          translations={translationSet}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}