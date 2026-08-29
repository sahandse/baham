"use client";

import { useMemo, useState } from "react";
import { CATALOG, type CatalogItem } from "@/lib/movies";
import { cn } from "@/lib/cn";

export function MoviePicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: CatalogItem) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"همه" | "فیلم" | "سریال">("همه");

  const results = useMemo(() => {
    return CATALOG.filter((item) => {
      const matchesQuery = item.title.includes(query.trim());
      const matchesFilter = filter === "همه" || item.kind === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <button
        aria-label="بستن"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-3xl border border-border bg-surface p-5 sm:max-w-lg sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">انتخاب فیلم یا سریال</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">
            ×
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی نام فیلم یا سریال..."
          className="mb-3 h-11 rounded-xl border border-border bg-surface-2 px-4 text-sm outline-none focus:border-accent"
        />

        <div className="mb-4 flex gap-2">
          {(["همه", "فیلم", "سریال"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                filter === f ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex flex-col overflow-hidden rounded-2xl border border-border text-right transition-transform active:scale-[0.97] hover:border-accent/50"
            >
              <div className={cn("flex h-24 items-end bg-gradient-to-br p-2", item.gradient)}>
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white">
                  {item.kind}
                </span>
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-muted">
                  {item.genre} · {item.year}
                </p>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted">چیزی پیدا نشد</p>
          )}
        </div>
      </div>
    </div>
  );
}
