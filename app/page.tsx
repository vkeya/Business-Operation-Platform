import Link from "next/link";
import { redirect } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingHero from "@/components/marketing/MarketingHero";
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
import MarketingFooter, {
  MarketingCTA,
} from "@/components/marketing/MarketingFooter";
import BusinessControl from "@/components/marketing/BusinessControl";
import BusinessIntelligence from "@/components/marketing/BusinessIntelligence";
import PlatformEcosystem from "@/components/marketing/PlatformEcosystem";
import IndustrySolutions from "@/components/marketing/IndustrySolutions";
import Image from "next/image";
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

      <MarketingNav />

      <MarketingHero />

	  <IndustrySolutions />

	  <PlatformEcosystem />

	  <BusinessIntelligence />

	  <BusinessControl />

      <section className="relative z-10 border-y border-slate-200/70 bg-white/70">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow">
              What SmatPic brings together
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              The moving parts of your business,
              connected.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Stop working across disconnected tools and
              processes. SmatPic gives your business a
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
  icon={<ShoppingCart size={22} />}
  title="Point of Sale"
  description="Sell from your connected workspace with product search, barcode scanning, payments, inventory updates, and receipts."
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
  description="Track sales activity and the money moving through your business across your connected operations."
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

      <section className="relative z-10 border-y border-slate-200/70 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow">
              Explore SmatPic
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Find the tools and solutions that fit your business.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Explore how SmatPic connects everyday business operations,
              from sales and inventory to purchasing and industry-specific
              workflows.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ExploreLink
              href="/business-management-software"
              title="Business Management Software"
              description="Bring everyday business operations into one connected workspace."
            />

            <ExploreLink
              href="/pos-system"
              title="POS System"
              description="Connect sales, payments, inventory, and receipts."
            />

            <ExploreLink
              href="/inventory-management"
              title="Inventory Management"
              description="Manage products, stock levels, and stock movement."
            />

            <ExploreLink
              href="/sales-management"
              title="Sales & Payment Management"
              description="Keep sales, payments, customers, and inventory connected."
            />

            <ExploreLink
              href="/purchasing-management"
              title="Purchasing & Supplier Management"
              description="Manage purchasing and supplier activity alongside stock."
            />

            <ExploreLink
              href="/solutions/pharmacy"
              title="Pharmacy Management"
              description="Explore pharmacy products, medicines, prescriptions, and batches."
            />

			<ExploreLink
              href="/register"
              title="Hospital Management"
              description="Connect hospital administration, patient services, billing, and operational workflows."
            />

            <ExploreLink
              href="/register"
              title="Restaurant Management"
              description="Bring restaurant sales, menu operations, inventory, and purchasing together."
            />

            <ExploreLink
              href="/register"
              title="Wines & Spirits Management"
              description="Manage product stock, sales, purchasing, and business operations in one workspace."
            />

            <ExploreLink
              href="/solutions/supermarket"
              title="Supermarket Management"
              description="Connect supermarket POS, products, inventory, and purchasing."
            />

            <ExploreLink
              href="/solutions/retail"
              title="Retail & Shop Management"
              description="Manage retail sales, products, stock, suppliers, and payments."
            />

            <ExploreLink
              href="/solutions/boutique"
              title="Boutique Management"
              description="Connect boutique products, inventory, sales, and purchasing."
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
            description="Start with your SmatPic account and create your secure access."
          />

          <Step
            number="02"
            title="Set up your business"
            description="Tell SmatPic about your business and create the foundation for your workspace."
          />

          <Step
            number="03"
            title="Start operating"
            description="Add your products, organize your operations, invite your team, and get moving."
          />
        </div>
      </section>

      <MarketingCTA />
      <MarketingFooter />
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

function ExploreLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <ArrowRight
          size={17}
          className="mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
        />
      </div>
    </Link>
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