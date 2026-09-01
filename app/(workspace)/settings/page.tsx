import Link from "next/link";
import {
ArrowUpRight,
Settings,
ShieldCheck,
Users,
Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
const settingsCards = [
{
title: "Currency",
description:
"Configure your business currency settings and financial preferences.",
href: "/settings/currency",
action: "Manage currency",
icon: Wallet,
iconLabel: "01",
},
{
title: "Users & Access",
description:
"Manage users, roles, and access for your business workspace.",
href: "/settings/users",
action: "Manage access",
icon: Users,
iconLabel: "02",
},
];

return ( <div className="space-y-6">
{/* Settings hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            Settings
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
            Workspace configuration
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Business settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Configure your business preferences, currency,
          users, and access settings.
        </p>
      </div>

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
        <Settings className="h-6 w-6" />
      </div>
    </div>
  </section>

  {/* Settings overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Configuration
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        Manage your workspace
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Control the settings that shape how your business
        workspace operates.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {settingsCards.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700 transition group-hover:bg-violet-50">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-[0.14em] text-slate-300">
                  {item.iconLabel}
                </span>

                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-700" />
              </div>
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
              {item.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {item.description}
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-700">
              {item.action}

              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        );
      })}
    </div>
  </section>

  {/* Workspace configuration */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        <ShieldCheck className="h-5 w-5" />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Workspace configuration
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-900">
          Keep your business settings organized
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Configure financial preferences and ensure your
          team has the appropriate level of access to your
          business workspace.
        </p>
      </div>
    </div>
  </section>
</div>


);
}
