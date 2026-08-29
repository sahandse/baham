import { cn } from "@/lib/cn";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-8 w-8 text-sm", md: "h-11 w-11 text-lg", lg: "h-16 w-16 text-2xl" }[size];
  return (
    <div
      className={cn(
        dims,
        "flex items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent-2 font-bold text-white shadow-lg shadow-accent/30"
      )}
    >
      ب
    </div>
  );
}
