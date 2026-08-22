interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  variant?: "revenue" | "profit" | "cash" | "receivables" | "payables" | "inventory";
}

export default function MetricCard({
  title,
  value,
  description,
  variant = "revenue",
}: MetricCardProps) {
  const accent =
    variant === "cash"
      ? "text-blue-600"
      : variant === "receivables"
        ? "text-purple-600"
        : variant === "payables"
          ? "text-amber-600"
          : variant === "inventory"
            ? "text-teal-700"
            : "text-emerald-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className={`mt-4 text-2xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
