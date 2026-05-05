import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Show the dot accent. */
  showDot?: boolean;
}

/**
 * Mizaan wordmark — text-only, no SVG dependency.
 * "Mizaan" in display font with a green Solana dot accent.
 */
export function Wordmark({ className, showDot = true }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[2px] font-semibold tracking-tight text-text",
        className,
      )}
    >
      <span>Mizaan</span>
      {showDot && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[6px] w-[6px] -translate-y-[2px] rounded-full bg-[var(--color-primary)]"
        />
      )}
    </span>
  );
}
