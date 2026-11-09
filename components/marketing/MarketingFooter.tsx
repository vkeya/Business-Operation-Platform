
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
} from "lucide-react";

const solutions = [
  { label: "Hospital", href: "/register" },
  { label: "Pharmacy", href: "/solutions/pharmacy" },
  { label: "Shop", href: "/solutions/retail" },
  { label: "Boutique", href: "/solutions/boutique" },
  { label: "Supermarket", href: "/solutions/supermarket" },
  { label: "Restaurant", href: "/register" },
  { label: "Wines & Spirits", href: "/register" },
];

const platform = [
  { label: "Business Management", href: "/business-management-software" },
  { label: "POS System", href: "/pos-system" },
  { label: "Inventory Management", href: "/inventory-management" },
  { label: "Purchasing Management", href: "/purchasing-management" },
  { label: "Sales Management", href: "/sales-management" },
  { label: "Help Centre", href: "/support" },
];

const legal = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms & Conditions", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Acceptable Use", href: "/legal/acceptable-use" },
];

export function MarketingCTA() {
  return (
    <section className="relative overflow-hidden bg-[#090D1C] px-6 py-24 text-white sm:py-28">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-60 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-300">
          Your business deserves better
        </p>

        <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-6xl">
          Stop managing disconnected systems.
          <span className="block text-violet-300">
            Start running a connected business.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          Bring your operations together with SmatPic. Get the visibility,
          structure and tools to manage your business with greater confidence.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-violet-500 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-900/30 transition hover:-translate-y-1 hover:bg-violet-400"
          >
            Start your free trial
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Talk to our team
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Start with the business capabilities you need today. Grow with SmatPic.
        </p>
      </div>
    </section>
  );
}

export default function MarketingFooter() {
  return (
    <footer className="bg-[#070B16] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/smatpic-icon.png"
                alt="SmatPic"
                width={42}
                height={42}
              />
              <span className="text-2xl font-extrabold tracking-tight text-white">
                SmatPic
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              One business. One platform. Complete control.
              Connected business operations and intelligence,
              built for the way different industries work.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <a
                href="mailto:info@smatpic.com"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <Mail size={16} className="text-violet-300" />
                info@smatpic.com
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-violet-300" />
                Built for growing businesses
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">Solutions</h3>
            <ul className="mt-5 space-y-3">
              {solutions.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition hover:text-violet-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">Platform</h3>
            <ul className="mt-5 space-y-3">
              {platform.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition hover:text-violet-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">Legal & account</h3>
            <ul className="mt-5 space-y-3">
              {legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition hover:text-violet-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-slate-400 transition hover:text-violet-300"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-400 transition hover:text-violet-300"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SmatPic. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            One Business. One Platform. Complete Control.
          </p>
        </div>
      </div>
    </footer>
  );
}
