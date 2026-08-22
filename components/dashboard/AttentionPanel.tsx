interface AttentionPanelProps {
  lowStockItems: number;
  pendingPurchases: number;
  receivables: boolean;
  payables: boolean;
}

export default function AttentionPanel({
  lowStockItems,
  pendingPurchases,
  receivables,
  payables,
}: AttentionPanelProps) {
  const items = [
    lowStockItems > 0 ? `${lowStockItems} low stock items require attention` : "No low stock issues",
    pendingPurchases > 0 ? `${pendingPurchases} purchases awaiting action` : "No pending purchases",
    receivables ? "Customer balances require review" : "No outstanding receivables",
    payables ? "Supplier obligations require review" : "No outstanding payables",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Attention Required
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
