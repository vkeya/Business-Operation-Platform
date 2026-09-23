import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Cookie,
  Server,
  Scale,
  LogIn,
} from "lucide-react";

const navigation = [
  {
    href: "/legal",
    label: "Legal & Privacy",
    icon: ShieldCheck,
  },
  {
    href: "/legal/terms",
    label: "Terms",
    icon: FileText,
  },
  {
    href: "/legal/privacy",
    label: "Privacy",
    icon: ShieldCheck,
  },
  {
    href: "/legal/acceptable-use",
    label: "Acceptable Use",
    icon: Scale,
  },
  {
    href: "/legal/cookies",
    label: "Cookies",
    icon: Cookie,
  },
  {
    href: "/legal/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    href: "/legal/service-level",
    label: "Service",
    icon: Server,
  },
  {
    href: "/legal/dpa",
    label: "DPA",
    icon: FileText,
  },
];

export default function LegalShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-200/15 blur-3xl" />
      </div>

      <div className="relative min-h-screen">
        {/* Primary header */}
        <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex min-h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/legal"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center">
                <Image
                  src="/smatpic-icon.png"
                  alt="SmatPic"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                  SmatPic
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  Business Operating System
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Sign in
                </span>
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Get started
              </Link>
            </div>
          </div>
        </header>

        {/* Legal navigation */}
        <div className="relative z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] overflow-x-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex min-w-max items-center gap-1 py-2">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Legal workspace */}
        <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}