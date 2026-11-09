
import Image from "next/image";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = await getAuthenticatedUser();

  const membership = await prisma.businessMembership.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      business: {
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
    },
  });

  if (membership) {
    redirect("/dashboard");
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <main className="min-h-screen bg-[#F7F7FC]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Brand header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/smatpic-icon.png"
              alt="SmatPic"
              width={44}
              height={44}
              priority
              className="rounded-xl"
            />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#020817]">
                SmatPic
              </p>
              <p className="text-xs text-slate-500">
                Business Operations Platform
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 sm:flex">
            <ShieldCheck className="h-4 w-4 text-[#08B6D9]" />
            <span className="text-xs font-medium text-slate-600">
              Secure business onboarding
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#020817] px-6 py-9 text-white shadow-2xl shadow-slate-900/10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#08B6D9]/20 blur-[100px]" />
            <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#1683D8]/20 blur-[100px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/95 to-transparent" />
          </div>

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#08B6D9]/30 bg-[#08B6D9]/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#08B6D9]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7DE5F5]">
                  Welcome to SmatPic
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your business.
                <br />
                <span className="bg-gradient-to-r from-[#08B6D9] to-[#1683D8] bg-clip-text text-transparent">
                  One intelligent workspace.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Set up your business on SmatPic and bring your operations,
                inventory, sales and business intelligence into one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm lg:min-w-[230px]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#08B6D9]/15">
                <Building2 className="h-6 w-6 text-[#08B6D9]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Business onboarding
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Start with the essentials
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="relative mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#08B6D9]" />
              Configure your business
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1683D8]" />
              Set up your operations
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
              Start managing your business
            </div>
          </div>
        </section>

        {/* Setup form section */}
        <section className="mt-9">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#08B6D9]">
                Business foundation
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#020817]">
                Create your workspace
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Tell us about your business. We will use these details to
                configure your SmatPic workspace.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(2,8,23,0.05)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#F7FBFD] px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#08B6D9]/10">
                  <Building2 className="h-4 w-4 text-[#08B6D9]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#020817]">
                    Business details
                  </p>
                  <p className="text-xs text-slate-500">
                    Your business configuration starts here
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <SetupForm translations={t} />
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SmatPic. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Built for better business operations.
          </p>
        </footer>
      </div>
    </main>
  );
}
