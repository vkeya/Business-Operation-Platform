
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  PackageCheck,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

const capabilities = [
  {
    number: "01",
    title: "Sales & Point of Sale",
    description:
      "Keep everyday selling connected to the rest of your business.",
    icon: ShoppingCart,
    features: [
      "Fast sales processing",
      "Barcode scanning",
      "Customer management",
      "Returns and receipts",
    ],
  },
  {
    number: "02",
    title: "Inventory Management",
    description:
      "Know what you have, what is moving and where your stock stands.",
    icon: Boxes,
    features: [
      "Product and category management",
      "Stock receiving and transfers",
      "Low-stock visibility",
      "Stock valuation",
    ],
  },
  {
    number: "03",
    title: "Purchasing & Suppliers",
    description:
      "Connect supplier relationships, purchasing and stock replenishment.",
    icon: PackageCheck,
    features: [
      "Supplier management",
      "Purchase orders",
      "Goods receiving",
      "Purchase tracking",
    ],
  },
  {
    number: "04",
    title: "Finance & Accounting",
    description:
      "Bring financial activity closer to the decisions you make every day.",
    icon: CircleDollarSign,
    features: [
      "Income and expenses",
      "Payment tracking",
      "Accounting records",
      "Financial visibility",
    ],
  },
  {
    number: "05",
    title: "People & Accountability",
    description:
      "Give your team access to the tools they need, with appropriate controls.",
    icon: Users,
    features: [
      "Team invitations",
      "Business roles",
      "Access permissions",
      "Audit activity",
    ],
  },
  {
    number: "06",
    title: "Reports & Intelligence",
    description:
      "Move beyond recording transactions to understanding business performance.",
    icon: ChartNoAxesCombined,
    features: [
      "Business reports",
      "Sales performance",
      "Stock intelligence",
      "Business insights",
    ],
  },
];

const connectedModules = [
  { label: "Sales", icon: ShoppingCart },
  { label: "Inventory", icon: Boxes },
  { label: "Purchasing", icon: ClipboardList },
  { label: "Finance", icon: Wallet },
  { label: "People", icon: Users },
  { label: "Reports", icon: FileBarChart },
];

export default function PlatformEcosystem() {
  return (
    <section
      id="platform"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-600">
            The SmatPic ecosystem
          </p>

          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Everything works better
            <span className="text-violet-600"> when it works together.</span>
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
            Your business doesn't operate in separate departments.
            Your software shouldn't either. SmatPic connects the
            activities, information and people that keep your business moving.
          </p>
        </div>

        <div className="mt-16 rounded-[2rem] bg-[#0B1020] p-7 text-white shadow-2xl shadow-slate-900/10 sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-300">
                One connected workspace
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                One business. Connected operations.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                Bring your operational activities into one place
                instead of chasing information across disconnected tools.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
              <BriefcaseBusiness size={30} />
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {connectedModules.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 text-center"
              >
                <Icon size={23} className="text-violet-300" />
                <span className="text-xs font-bold text-slate-200">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Connected business operations
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.number}
                className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={23} />
                  </span>

                  <span className="text-sm font-extrabold text-slate-300">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold tracking-tight text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-3xl border border-violet-100 bg-violet-50/60 p-7 sm:flex-row sm:p-9">
          <div>
            <h3 className="text-xl font-extrabold text-slate-950">
              Ready to bring your business together?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with the tools your business needs today.
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-violet-700"
          >
            Explore SmatPic
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
