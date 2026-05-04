"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-950 disabled:bg-ink-300 disabled:text-ink-100",
  secondary:
    "bg-white text-ink-950 hairline hover:bg-ink-50 focus-visible:ring-ink-300",
  ghost:
    "bg-transparent text-ink-700 hover:text-ink-950 hover:bg-black/5 focus-visible:ring-ink-200",
  danger:
    "bg-white text-red-600 hairline hover:bg-red-50 focus-visible:ring-red-300",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-full",
  md: "h-10 px-4 text-sm rounded-full",
  lg: "h-12 px-6 text-sm rounded-full",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 font-medium tracking-tight transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
