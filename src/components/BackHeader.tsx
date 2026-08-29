import Link from "next/link";

export function BackHeader({ href, title }: { href: string; title: string }) {
  return (
    <div className="safe-top flex items-center gap-3 px-6 pb-2">
      <Link
        href={href}
        aria-label="بازگشت"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors hover:bg-surface"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
      <h1 className="text-base font-bold">{title}</h1>
    </div>
  );
}
