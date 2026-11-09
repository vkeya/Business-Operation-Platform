import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  Headphones,
} from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import ContactForm from "@/components/marketing/ContactForm";


export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the SmatPic team about business management software, product demonstrations, pricing, onboarding, and solutions for your business.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: "https://www.smatpic.com/contact",
    siteName: "SmatPic",
    title: "Contact SmatPic | Talk to Our Team",
    description:
      "Request a SmatPic product demo, discuss pricing, or find the right business operations solution for your business.",
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
    title: "Contact SmatPic | Talk to Our Team",
    description:
      "Connect with the SmatPic team about demos, pricing, onboarding, and business solutions.",
	images: ["/og-smatpic.png"],
  },
};


export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <MarketingNav />

      <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-24">
        <div className="ambient-orb ambient-orb-primary -right-32 -top-20 h-96 w-96 opacity-20" />

        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700"
            >
              <ArrowLeft size={16} />
              Back to homepage
            </Link>

            <p className="eyebrow mt-12">Let's talk business</p>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Let's find the right SmatPic solution for your business.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Whether you need a product demonstration, have questions
              about pricing, or want to discuss your business requirements,
              our team is ready to help.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <CalendarDays size={22} />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-950">
                    Request a product demo
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    See how SmatPic can support your business operations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <MessageSquare size={22} />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-950">
                    Discuss your requirements
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Tell us about your business and the challenges you want
                    to solve.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Headphones size={22} />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-950">
                    Get onboarding assistance
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Speak with our team about getting your business started.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Send us an enquiry
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share a few details and we'll get back to you.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}