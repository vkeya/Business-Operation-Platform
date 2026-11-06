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
    default: "SmatPic | Business Management Software for Growing Businesses",
    template: "%s | SmatPic",
  },
  description:
    "Manage sales, POS, inventory, purchasing, suppliers, payments, and business performance from one connected business management platform.",
  applicationName: "SmatPic",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.smatpic.com/",
    siteName: "SmatPic",
    title: "SmatPic | Business Management Software",
    description:
      "Run your business with connected POS, inventory, purchasing, payments, and business intelligence.",
    locale: "en",
	images: [
      {
        url: "/og-smatpic.png",
        width: 1200,
        height: 630,
        alt: "SmatPic Business Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmatPic | Business Management Software",
    description:
      "Run your business with connected POS, inventory, purchasing, payments, and business intelligence.",
	images: ["/og-smatpic.png"],
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