
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

const links = [
  { label: "Platform", href: "/#platform" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Intelligence", href: "/#intelligence" },
];

export default function MarketingNav() {
  return (
    <header className="relative z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/smatpic-icon.png"
            alt="SmatPic"
            width={42}
            height={42}
            priority
          />
          <span>
            <span className="block text-xl font-extrabold tracking-tight text-slate-950">
              SmatPic
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Business Operating System
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 transition hover:text-violet-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
          >
            Get started <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            aria-label="Mobile menu"
            className="rounded-xl border border-slate-200 p-3 text-slate-700 md:hidden"
          >
            <Menu size={19} />
          </button>
        </div>
      </nav>
    </header>
  );
}
