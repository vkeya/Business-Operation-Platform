
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

const modules = [
  { icon: ShoppingCart, label: "Sales & POS", detail: "Every transaction connected" },
  { icon: Boxes, label: "Inventory", detail: "Know what you have and where" },
  { icon: CircleDollarSign, label: "Finance", detail: "See the numbers that matter" },
  { icon: Users, label: "Your team", detail: "People, roles and accountability" },
];

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden bg-[#090D1C] text-white">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-32">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-violet-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            One connected business platform
          </div>

          <h1 className="mt-8 max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            One business.
            <span className="block text-violet-300">One platform.</span>
            <span className="block">Complete control.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
            Your sales, stock, purchasing, finance, people and business
            intelligence — working together in one intelligent operating
            system. Less chasing information. More control over what happens next.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-violet-500 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-900/40 transition hover:-translate-y-0.5 hover:bg-violet-400"
            >
              Start your 14-day free trial
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#platform"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore the platform
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              One connected workspace
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Built for multiple industries
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-violet-500/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11182B] p-5 shadow-2xl shadow-black/40 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                  SmatPic Business OS
                </p>
                <h2 className="mt-2 text-xl font-extrabold">Your business. Connected.</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <BarChart3 size={22} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {modules.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <Icon size={20} className="text-violet-300" />
                  <p className="mt-4 text-sm font-extrabold text-white">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-200">
                  Business intelligence
                </p>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                  Connected
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Turn operational information into clearer decisions about
                stock, sales, performance and growth.
              </p>
            </div>

            <p className="mt-5 text-center text-xs font-medium text-slate-500">
              One platform. Multiple business capabilities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
