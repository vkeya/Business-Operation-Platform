import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { prisma } from "@/lib/database/prisma";
import {
  getAuthenticatedUser,
} from "@/lib/auth/auth";

export default async function HomePage() {
  let user = null;

  try {
    user = await getAuthenticatedUser();
  } catch {
    user = null;
  }

  if (user) {
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
          businessId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (!membership) {
      redirect("/setup");
    }

    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-primary -left-40 -top-40 h-96 w-96"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-warm -right-32 top-80 h-80 w-80"
      />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
              <Workflow size={20} />
            </span>

            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-950">
                Teketeke
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Business OS
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 shadow-sm">
              <Sparkles
                size={14}
                className="text-violet-600"
              />

              <span className="eyebrow">
                Business operations, simplified
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Everything your business needs to
              <span className="text-violet-600">
                {" "}
                move forward.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Teketeke brings your business operations
              into one connected workspace. Manage the
              moving parts, understand what is happening,
              and build a stronger foundation for growth.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              <Benefit label="One connected workspace" />

              <Benefit label="Built around your business" />

              <Benefit label="Ready to grow with you" />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                Start with Teketeke
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sign in to your workspace
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="ambient-orb ambient-orb-primary left-10 top-10 h-72 w-72 opacity-25"
            />

            <div className="premium-surface relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">
                    Your business
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                    One clear view.
                  </h2>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <BarChart3 size={22} />
                </span>
              </div>

              <div className="mt-8 grid gap-3">
                <PreviewRow
                  icon={<ShoppingCart size={18} />}
                  title="Sales"
                  description="Understand what is moving"
                />

                <PreviewRow
                  icon={<Package size={18} />}
                  title="Inventory"
                  description="Keep your stock visible"
                />

                <PreviewRow
                  icon={<CircleDollarSign size={18} />}
                  title="Finance"
                  description="Track the numbers that matter"
                />

                <PreviewRow
                  icon={<Users size={18} />}
                  title="Your team"
                  description="Give people the right access"
                />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">
                  Teketeke intelligence
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  A connected foundation designed to help
                  you spend less time chasing information
                  and more time moving your business forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-slate-200/70 bg-white/70">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow">
              What Teketeke brings together
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              The moving parts of your business,
              connected.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Stop working across disconnected tools and
              processes. Teketeke gives your business a
              connected operational foundation.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Workflow size={22} />}
              title="Business Operations"
              description="Organize the essential activities that keep your business moving."
            />

            <FeatureCard
              icon={<Boxes size={22} />}
              title="Inventory"
              description="Track products and stock movement with better visibility."
            />

            <FeatureCard
              icon={<ShoppingCart size={22} />}
              title="Purchasing"
              description="Manage suppliers and purchasing from the same workspace."
            />

            <FeatureCard
              icon={<CircleDollarSign size={22} />}
              title="Sales & Payments"
              description="Understand sales activity and the money moving through your business."
            />

            <FeatureCard
              icon={<Users size={22} />}
              title="Your Team"
              description="Invite users and give people the appropriate level of access."
            />

            <FeatureCard
              icon={<Sparkles size={22} />}
              title="Business Intelligence"
              description="Build toward smarter, more informed, and more efficient operations."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="eyebrow">
            Getting started
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            From account to business workspace in three
            simple steps.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <Step
            number="01"
            title="Create your account"
            description="Start with your Teketeke account and create your secure access."
          />

          <Step
            number="02"
            title="Set up your business"
            description="Tell Teketeke about your business and create the foundation for your workspace."
          />

          <Step
            number="03"
            title="Start operating"
            description="Add your products, organize your operations, invite your team, and get moving."
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950">
        <div
          aria-hidden="true"
          className="ambient-orb ambient-orb-primary -right-24 -top-24 h-80 w-80 opacity-30"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="eyebrow text-violet-300">
              Built to grow
            </p>

            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Start with what your business needs today.
              Grow into what it needs tomorrow.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Teketeke gives you a strong operational
              foundation today while creating room for your
              business to evolve as it grows.
            </p>

            <Link
              href="/register"
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-violet-50"
            >
              Create your workspace
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="font-semibold text-slate-700">
            © {new Date().getFullYear()} Teketeke.
          </p>

          <p>
            Business operations, tailored to your business.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Benefit({
  label,
}: {
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Check
        size={16}
        className="text-violet-600"
      />

      {label}
    </span>
  );
}

function PreviewRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        {icon}
      </span>

      <div>
        <p className="text-sm font-extrabold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        {icon}
      </span>

      <h3 className="mt-6 text-lg font-extrabold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20">
        {number}
      </span>

      <h3 className="mt-7 text-xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}