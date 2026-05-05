import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] font-medium tracking-tight transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] active:translate-y-[0.5px]",
  secondary:
    "bg-white/10 text-text hover:bg-white/15 border border-white/10",
  ghost: "bg-transparent text-text hover:bg-white/5",
  outline:
    "bg-transparent text-text border border-white/15 hover:border-[var(--color-border-accent)] hover:text-[var(--color-primary)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
