import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { prisma } from "@/lib/database/prisma";
import { getLocale } from "@/lib/i18n/locale";
import {
  getTranslations,
} from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teketeke",
  description: "Business operations, tailored to your business.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const business = await prisma.business.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      name: true,
      type: true,
    },
  });
  
  const locale = await getLocale();
  
  const translationSet =
  getTranslations(locale);

  return (
    <html lang="en">
      <body>
        <AppShell
  businessName={business?.name}
  businessType={business?.type}
  currentLocale={locale}
  translations={translationSet}
>
  {children}
</AppShell>
      </body>
    </html>
  );
}