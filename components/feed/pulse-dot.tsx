import { cn } from "@/lib/utils";

type PulseDotSize = "xs" | "sm" | "md";
type PulseDotTone = "live" | "neutral" | "warning";

interface PulseDotProps {
  size?: PulseDotSize;
  tone?: PulseDotTone;
  className?: string;
}

const SIZE_MAP: Record<PulseDotSize, string> = {
  xs: "size-1",
  sm: "size-1.5",
  md: "size-2",
};

const TONE_MAP: Record<
  PulseDotTone,
  { core: string; ring: string; glow: string }
> = {
  live: {
    core: "bg-[#14F195]",
    ring: "bg-[#14F195]",
    glow: "0 0 6px rgba(20,241,149,0.6)",
  },
  neutral: {
    core: "bg-[#EFEFE48C]",
    ring: "bg-[#EFEFE48C]",
    glow: "0 0 4px rgba(239,239,228,0.35)",
  },
  warning: {
    core: "bg-[#FFC107]",
    ring: "bg-[#FFC107]",
    glow: "0 0 5px rgba(255,193,7,0.55)",
  },
};

/**
 * Tiny animated indicator: a steady core dot with a single
 * outward-expanding ring (CSS only). Reused across the live feed
 * to communicate "this is streaming".
 */
export function PulseDot({
  size = "sm",
  tone = "live",
  className,
}: PulseDotProps) {
  const sizeClass = SIZE_MAP[size];
  const palette = TONE_MAP[tone];

  return (
    <span
      aria-hidden
      className={cn("relative inline-flex shrink-0", sizeClass, className)}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping",
          palette.ring,
        )}
      />
      <span
        className={cn("relative rounded-full", sizeClass, palette.core)}
        style={{ boxShadow: palette.glow }}
      />
    </span>
  );
}
