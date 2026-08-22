import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
}

export default function QuickActionCard({
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </Link>
  );
}
