
import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
  Users,
  UserCog,
  Building2,
} from "lucide-react";
import Link from "next/link";

const controls = [
  {
    icon: Users,
    title: "Team management",
    description:
      "Bring your team into one workspace and manage business access centrally.",
  },
  {
    icon: LockKeyhole,
    title: "Role-based permissions",
    description:
      "Give team members access according to their responsibilities.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit trails",
    description:
      "Maintain visibility into important business activities and changes.",
  },
  {
    icon: Activity,
    title: "Operational visibility",
    description:
      "Understand activity across your business from a connected workspace.",
  },
  {
    icon: Building2,
    title: "Business separation",
    description:
      "Keep business information and access scoped to the appropriate business.",
  },
  {
    icon: UserCog,
    title: "Accountability",
    description:
      "Support clearer ownership and responsibility across your operations.",
  },
];

export default function BusinessControl() {
  return (
    <section className="bg-[#F7F7FC] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-600">
              Control. Visibility. Accountability.
            </p>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Stay in control of
              <span className="block text-violet-600">
                what matters most.
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600">
              As your business grows, managing people, information and
              responsibilities becomes more important. SmatPic brings
              essential controls into one connected operating environment.
            </p>

            <div className="mt-9 flex items-start gap-4 rounded-2xl border border-violet-100 bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950">
                  Built for responsible business operations
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Organise access, responsibilities and operational
                  visibility as your business evolves.
                </p>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-violet-700"
            >
              Take control of your business
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Icon size={23} />
                </span>

                <h3 className="mt-5 text-lg font-extrabold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
