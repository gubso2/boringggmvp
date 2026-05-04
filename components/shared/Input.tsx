"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl bg-white px-3.5 text-[15px] text-ink-950 placeholder:text-ink-400",
        "hairline transition-colors focus:border-ink-950/30 focus:outline-none focus:ring-2 focus:ring-ink-950/10",
        className,
      )}
      {...props}
    />
  );
});
