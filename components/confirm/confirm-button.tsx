"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ConfirmVariant = "primary" | "outline";

export interface ConfirmButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ConfirmVariant;
  /** Optional leading icon (rendered to the left of children). */
  leadingIcon?: React.ReactNode;
  loading?: boolean;
}

/**
 * Touch-friendly, full-width mobile button for the /confirm flow.
 *
 * - `primary` is the green "terima & konfirmasi" button — 56px tall, soft
 *   green halo, weighted for thumbs.
 * - `outline` is the muted decline / secondary action — 48px tall.
 *
 * Both stretch to fill the parent width so they read as "primary action of
 * this screen" rather than inline buttons.
 */
export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  function ConfirmButton(
    {
      className,
      variant = "primary",
      leadingIcon,
      loading,
      type = "button",
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    const base =
      "inline-flex w-full items-center justify-center gap-2.5 rounded-[14px] font-medium tracking-[-0.01em] transition-[transform,opacity,background-color,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818] active:scale-[0.99]";

    const variants: Record<ConfirmVariant, string> = {
      primary:
        "h-14 bg-[#14F195] text-[#181818] text-base [box-shadow:0_8px_24px_rgba(20,241,149,0.25),inset_0_1px_0_rgba(255,255,255,0.30)] hover:bg-[#11D985]",
      outline:
        "h-12 border border-[#FFFFFF1F] bg-transparent text-sm text-[#EFEFE4A6] hover:border-[#FFFFFF33] hover:text-text",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(base, variants[variant], className)}
        {...rest}
      >
        {loading ? (
          <span
            aria-hidden
            className={cn(
              "inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent",
              variant === "primary" && "border-[#181818] border-r-transparent",
            )}
          />
        ) : (
          leadingIcon && <span aria-hidden>{leadingIcon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  },
);
