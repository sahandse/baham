"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-tr from-accent to-accent-2 text-white shadow-lg shadow-accent/25 active:scale-[0.98] hover:brightness-110",
  secondary:
    "bg-surface-2 text-foreground border border-border active:scale-[0.98] hover:bg-surface-2/70",
  ghost: "bg-transparent text-foreground hover:bg-surface-2 active:scale-[0.98]",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-14 px-6 text-base gap-3",
};

const base =
  "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none";

export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  children,
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  children,
  className,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
    >
      {icon}
      {children}
    </Link>
  );
}
