import type { Metadata } from "next";
import { Fraunces, Nunito, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.smatpic.com"),
  title: {
    default: "SmatPic | Business Operations Platform",
    template: "%s | SmatPic",
  },
  description:
    "SmatPic brings sales, inventory, purchasing, payments, and business operations into one connected workspace.",
  applicationName: "SmatPic",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.smatpic.com/",
    siteName: "SmatPic",
    title: "SmatPic | Business Operations Platform",
    description:
      "SmatPic brings sales, inventory, purchasing, payments, and business operations into one connected workspace.",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmatPic | Business Operations Platform",
    description:
      "SmatPic brings sales, inventory, purchasing, payments, and business operations into one connected workspace.",
  },
  icons: {
    icon: "/smatpic-icon.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.smatpic.com/#organization",
      name: "SmatPic",
      url: "https://www.smatpic.com/",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.smatpic.com/#website",
      name: "SmatPic",
      url: "https://www.smatpic.com/",
      publisher: {
        "@id": "https://www.smatpic.com/#organization",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.smatpic.com/#application",
      name: "SmatPic",
      url: "https://www.smatpic.com/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: {
        "@id": "https://www.smatpic.com/#organization",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={nunito.variable}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}