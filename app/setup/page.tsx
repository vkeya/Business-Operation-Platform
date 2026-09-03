import { Building2, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user =
    await getAuthenticatedUser();

  const membership =
    await prisma.businessMembership.findFirst({
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Accounting-style hero */}
        <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  Teketeke
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Business setup
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Set up your business
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Create your business workspace and configure
                the foundation for managing your operations.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* Setup workspace */}
        <section className="mt-6">
          <div className="mb-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />

              Business foundation
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Create your workspace
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete the details below to get your Teketeke
              business workspace ready.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <SetupForm translations={t} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}