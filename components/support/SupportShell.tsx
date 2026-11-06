import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SupportShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative z-10 border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/smatpic-icon.png"
              alt="SmatPic"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-950">
                SmatPic
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Business OS
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/support"
              className="hidden rounded-xl px-3 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-violet-50 sm:inline-flex"
            >
              Help &amp; Support
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
            >
              <span className="hidden sm:inline">Start free trial</span>
              <span className="sm:hidden">Get started</span>
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <p>© {new Date().getFullYear()} SmatPic. All rights reserved.</p>
            <p className="mt-1">
              Business operations, tailored to your business.
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/support" className="hover:text-violet-700">
              Help Centre
            </Link>
            <Link href="/support#contact" className="hover:text-violet-700">
              Contact Support
            </Link>
            <Link href="/legal/terms" className="hover:text-violet-700">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-violet-700">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
