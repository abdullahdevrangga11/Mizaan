import { cn } from "@/lib/utils";

interface MizaanIconProps {
  className?: string;
  /** Optional decorative role override. Defaults to aria-hidden. */
  title?: string;
}

/**
 * Mizaan brand mark — three solid green crescents stacked into an
 * abstract "scale" (Arabic: ميزان). Sized via `className` like any
 * other element; the SVG fills its container.
 *
 * Kept in sync with `app/icon.svg` (the favicon source of truth).
 */
export function MizaanIcon({ className, title }: MizaanIconProps) {
  return (
    <svg
      viewBox="0 0 838 971"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("block h-full w-full", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M738.933 405.476C793.251 608.193 671.869 816.851 467.818 871.526C263.767 926.201 54.3179 806.19 0 603.473L738.933 405.476Z"
        fill="#5BE791"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M577.95 326.645C544.359 452.009 415.499 526.406 290.135 492.815C164.77 459.224 90.3735 330.365 123.965 205L577.95 326.645Z"
        fill="#5BE791"
      />
      <circle cx="481.642" cy="147.5" r="147.5" fill="#5BE791" />
    </svg>
  );
}
