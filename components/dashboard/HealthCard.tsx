interface HealthCardProps {
  title: string;
  status: string;
  description: string;
}

export default function HealthCard({
  title,
  status,
  description,
}: HealthCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-lg font-semibold text-slate-900">
        {status}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
