"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { getEmbedInfo } from "@/lib/embed";
import type { Movie } from "@/lib/movies";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onChange() {
      const doc = document as FullscreenDocument;
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  async function toggle() {
    const el = ref.current as FullscreenElement | null;
    const doc = document as FullscreenDocument;
    if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
      if (el?.requestFullscreen) await el.requestFullscreen();
      else if (el?.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  }

  return { isFullscreen, toggle };
}

export function PlayerCard({
  movie,
  playing,
  onTogglePlay,
  onChangeMovie,
}: {
  movie: Movie;
  playing: boolean;
  onTogglePlay: () => void;
  onChangeMovie: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const embed = movie.url ? getEmbedInfo(movie.url) : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div
        ref={containerRef}
        className={cn(
          "group relative flex aspect-video items-center justify-center bg-black",
          !embed && "bg-gradient-to-br",
          !embed && movie.gradient
        )}
      >
        {embed?.kind === "file" && (
          <video src={embed.src} controls className="h-full w-full object-contain" />
        )}

        {embed?.kind === "iframe" && (
          <iframe
            src={embed.src}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        )}

        {!embed && (
          <>
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
            {playing && (
              <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                پخش هم‌زمان برای همه اعضا
              </span>
            )}
          </>
        )}

        <span className="absolute top-3 right-3 z-10 rounded-full bg-black/30 px-2.5 py-1 text-[11px] text-white">
          {movie.kind}
        </span>

        <button
          onClick={toggle}
          aria-label={isFullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}
          className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-bold">{movie.title}</p>
          <p className="text-xs text-muted">
            {movie.genre && movie.year ? `${movie.genre} · ${movie.year}` : movie.url ? "لینک مستقیم" : ""}
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

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v3a2 2 0 0 1-2 2H4M15 3v3a2 2 0 0 0 2 2h3M9 21v-3a2 2 0 0 0-2-2H4M15 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
