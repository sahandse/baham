"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, hint, error, className, id, ...rest }: FieldProps) {
  const inputId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5 text-right">
      <label htmlFor={inputId} className="text-sm text-muted px-1">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-12 rounded-2xl bg-surface border border-border px-4 text-base text-foreground outline-none transition-colors",
          "focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-danger px-1">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted px-1">{hint}</span>
      ) : null}
    </div>
  );
}
