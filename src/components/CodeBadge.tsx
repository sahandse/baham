"use client";

import { useState } from "react";

export function CodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 transition-colors hover:border-accent/50"
      dir="ltr"
    >
      <span className="font-mono text-lg tracking-[0.3em] font-semibold text-foreground">{code}</span>
      <span className="text-muted text-xs">{copied ? "کپی شد ✓" : "کپی"}</span>
    </button>
  );
}
