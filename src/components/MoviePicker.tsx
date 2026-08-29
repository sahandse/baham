"use client";

import { useMemo, useState } from "react";
import { CATALOG, movieFromLink, type Movie, type MovieKind } from "@/lib/movies";
import { cn } from "@/lib/cn";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";

export function MoviePicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: Movie) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"catalog" | "link">("catalog");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <button aria-label="بستن" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-3xl border border-border bg-surface p-5 sm:max-w-lg sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">انتخاب فیلم یا سریال</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">
            ×
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <TabButton active={tab === "catalog"} onClick={() => setTab("catalog")}>
            کاتالوگ نمونه
          </TabButton>
          <TabButton active={tab === "link"} onClick={() => setTab("link")}>
            لینک مستقیم
          </TabButton>
        </div>

        {tab === "catalog" ? (
          <CatalogTab onSelect={onSelect} />
        ) : (
          <LinkTab onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function CatalogTab({ onSelect }: { onSelect: (item: Movie) => void }) {
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
    <>
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
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white">{item.kind}</span>
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-[11px] text-muted">
                {item.genre} · {item.year}
              </p>
            </div>
          </button>
        ))}
        {results.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted">چیزی پیدا نشد</p>}
      </div>
    </>
  );
}

function LinkTab({ onSelect }: { onSelect: (item: Movie) => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<MovieKind>("فیلم");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("عنوان رو وارد کن");
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setError("لینک معتبر نیست، آدرس کامل رو وارد کن (با https://)");
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      setError("فقط لینک‌های http یا https پشتیبانی می‌شه");
      return;
    }
    setError("");
    onSelect(movieFromLink({ title, kind, url: parsed.toString() }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pb-2">
      <Field label="عنوان" placeholder="مثلاً: قسمت ۵" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />

      <div className="flex flex-col gap-1.5 text-right">
        <label className="px-1 text-sm text-muted">نوع</label>
        <div className="flex gap-2">
          {(["فیلم", "سریال"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                kind === k ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-foreground"
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="لینک مستقیم فیلم/سریال"
        placeholder="https://..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        dir="ltr"
        className="text-left"
        hint="فایل مستقیم (mp4/…)، یوتیوب یا آپارات پشتیبانی می‌شه"
        error={error}
      />

      <Button type="submit" fullWidth>
        افزودن و پخش
      </Button>
    </form>
  );
}
