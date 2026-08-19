"use client";

import { useEffect, useState } from "react";
import { searchProductsAction } from "./listActions";

interface ProductSearchProps {
  onResults: (
    products: Awaited<
      ReturnType<typeof searchProductsAction>
    >,
  ) => void;
  onClear: () => void;
}

export default function ProductSearch({
  onResults,
  onClear,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchTerm = query.trim();

    if (!searchTerm) {
  onClear();
  return;
}

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const products =
          await searchProductsAction(searchTerm);

        onResults(products);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, onResults]);

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder="Search products..."
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-64"
      />

      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          Searching...
        </span>
      )}
    </div>
  );
}