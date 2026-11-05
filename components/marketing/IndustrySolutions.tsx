
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Clock3,
  GraduationCap,
  Hotel,
  Package,
  Pill,
  ShoppingBag,
  ShoppingCart,
  Wine,
  Store,
} from "lucide-react";

const availableIndustries = [
  {
    name: "Hospital",
    description:
      "Connect hospital operations, billing, invoices and patient-facing workflows.",
    href: "/register",
    icon: Building2,
    label: "Healthcare operations",
  },
  {
    name: "Pharmacy",
    description:
      "Manage medicines, batches, stock movement, sales and pharmacy operations.",
    href: "/solutions/pharmacy",
    icon: Pill,
    label: "Medicine & inventory",
  },
  {
    name: "Shop",
    description:
      "Manage everyday retail sales, products, purchasing and stock in one place.",
    href: "/solutions/retail",
    icon: ShoppingBag,
    label: "Retail management",
  },
  {
    name: "Boutique",
    description:
      "Manage fashion products, sizes, colours, inventory, sales and purchasing.",
    href: "/solutions/boutique",
    icon: Store,
    label: "Fashion & apparel",
  },
  {
    name: "Supermarket",
    description:
      "Bring checkout, products, inventory, purchasing and store operations together.",
    href: "/solutions/supermarket",
    icon: ShoppingCart,
    label: "High-volume retail",
  },
  {
    name: "Restaurant",
    description:
      "Bring restaurant sales, menu and operational workflows into one workspace.",
    href: "/register",
    icon: Building2,
    label: "Food & hospitality",
  },
  {
    name: "Wines & Spirits",
    description:
      "Manage beverage products, sales, purchasing and stock visibility.",
    href: "/register",
    icon: Wine,
    label: "Specialist retail",
  },
];

const comingSoonIndustries = [
  {
    name: "School",
    description:
      "Purpose-built business workflows for education institutions.",
    icon: GraduationCap,
  },
  {
    name: "Warehouse",
    description:
      "More advanced warehouse and stock management capabilities.",
    icon: Package,
  },
  {
    name: "Hotel",
    description:
      "Connected operational tools for hotels and accommodation businesses.",
    icon: Hotel,
  },
];

export default function IndustrySolutions() {
  return (
    <section
      id="solutions"
      className="relative overflow-hidden bg-[#F7F7FC] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-600">
              One platform. Different industries.
            </p>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Built around the way
              <span className="text-violet-600"> your business works.</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              A hospital doesn't operate like a supermarket. A pharmacy
              doesn't operate like a restaurant. SmatPic brings industry-aware
              workflows together on one connected business platform.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            7 business solutions available
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {availableIndustries.map((industry, index) => {
            const Icon = industry.icon;

            return (
              <Link
                key={industry.name}
                href={industry.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={25} />
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Available
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-600">
                  {industry.label}
                </p>

                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                  {industry.name}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                  {industry.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-extrabold text-slate-800">
                    Explore solution
                  </span>
                  <ArrowUpRight
                    size={19}
                    className="text-slate-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-600"
                  />
                </div>

                <span className="absolute -bottom-10 -right-8 text-8xl font-black text-slate-50 transition group-hover:text-violet-50">
                  0{index + 1}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-20 border-t border-slate-200 pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                What's coming next
              </p>

              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                More industries. More possibilities.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                We're expanding the SmatPic ecosystem to support even more
                types of businesses.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Clock3 size={15} />
              On the SmatPic roadmap
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {comingSoonIndustries.map((industry) => {
              const Icon = industry.icon;

              return (
                <div
                  key={industry.name}
                  className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Icon size={21} />
                    </span>

                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                      Coming soon
                    </span>
                  </div>

                  <h4 className="mt-5 text-lg font-extrabold text-slate-800">
                    {industry.name}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {industry.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
