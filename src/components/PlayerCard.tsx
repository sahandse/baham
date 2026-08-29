"use client";

import { cn } from "@/lib/cn";
import type { CatalogItem } from "@/lib/movies";

export function PlayerCard({
  movie,
  playing,
  onTogglePlay,
  onChangeMovie,
}: {
  movie: CatalogItem;
  playing: boolean;
  onTogglePlay: () => void;
  onChangeMovie: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className={cn("relative flex aspect-video items-center justify-center bg-gradient-to-br", movie.gradient)}>
        <div className="absolute inset-0 bg-black/20" />
        <button
          onClick={onTogglePlay}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 hover:bg-white/30"
          aria-label={playing ? "توقف" : "پخش"}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="absolute top-3 right-3 z-10 rounded-full bg-black/30 px-2.5 py-1 text-[11px] text-white">
          {movie.kind}
        </span>
        {playing && (
          <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            پخش هم‌زمان برای همه اعضا
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-bold">{movie.title}</p>
          <p className="text-xs text-muted">
            {movie.genre} · {movie.year}
          </p>
        </div>
        <button
          onClick={onChangeMovie}
          className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs text-muted transition-colors hover:text-foreground hover:border-accent/50"
        >
          تغییر فیلم
        </button>
      </div>
    </div>
  );
}
