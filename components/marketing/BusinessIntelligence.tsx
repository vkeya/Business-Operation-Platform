
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ChartColumnIncreasing,
  CircleDollarSign,
  PackageSearch,
  ShoppingBasket,
  TrendingUp,
  Users,
  Truck,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

const intelligenceFeatures = [
  {
    title: "Stock Intelligence",
    description:
      "Understand stock levels, stock value, low-stock risks and inventory movement.",
    icon: Boxes,
    tag: "Inventory visibility",
  },
  {
    title: "Basket Intelligence",
    description:
      "Explore purchasing patterns and understand how products perform together.",
    icon: ShoppingBasket,
    tag: "Product relationships",
  },
  {
    title: "Demand & Forecasting",
    description:
      "Use demand patterns and historical activity to support better stock planning.",
    icon: TrendingUp,
    tag: "Demand planning",
  },
  {
    title: "Pricing & Promotion Intelligence",
    description:
      "Gain visibility into pricing decisions, promotions and their business impact.",
    icon: CircleDollarSign,
    tag: "Pricing insights",
  },
  {
    title: "Sales Intelligence",
    description:
      "Understand sales performance, trends and the products driving business activity.",
    icon: ChartColumnIncreasing,
    tag: "Sales performance",
  },
  {
    title: "Customer Intelligence",
    description:
      "Build a clearer picture of customer activity, purchasing behaviour and value.",
    icon: Users,
    tag: "Customer insights",
  },
  {
    title: "Supplier Intelligence",
    description:
      "Understand supplier activity and purchasing patterns to support better decisions.",
    icon: Truck,
    tag: "Supplier insights",
  },
  {
    title: "Profitability Intelligence",
    description:
      "Look beyond sales totals to understand margins, costs and business profitability.",
    icon: BarChart3,
    tag: "Financial performance",
  },
];

export default function BusinessIntelligence() {
  return (
    <section
      id="intelligence"
      className="relative overflow-hidden bg-[#090D1C] py-24 text-white sm:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute -right-48 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-300">
              Beyond everyday operations
            </p>

            <h2 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">
              Don't just run your business.
              <span className="block text-violet-300">
                Understand it.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Every sale, stock movement, purchase and customer interaction
              tells a story. SmatPic brings business information together
              to help you see patterns, identify opportunities and make
              more informed decisions.
            </p>
          </div>

          <div className="rounded-3xl border border-violet-400/20 bg-violet-500/10 p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
              <Lightbulb size={25} />
            </div>

            <h3 className="mt-5 text-xl font-extrabold">
              From information to insight
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              See more than individual transactions. Connect operational
              activity to the bigger picture of your business.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intelligenceFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500 group-hover:text-white">
                    <Icon size={23} />
                  </span>

                  <span className="text-xs font-bold text-slate-600">
                    0{index + 1}
                  </span>
                </div>

                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-violet-300">
                  {feature.tag}
                </p>

                <h3 className="mt-2 text-lg font-extrabold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-300">
              Better visibility. Better decisions.
            </p>
            <h3 className="mt-3 text-2xl font-extrabold">
              Make your business information work harder.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Bring operational reporting and business intelligence
              into your management workflow.
            </p>
          </div>

          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-violet-500 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-violet-400"
          >
            Discover SmatPic
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
