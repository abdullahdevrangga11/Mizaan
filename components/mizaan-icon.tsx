import { cn } from "@/lib/utils";

interface MizaanIconProps {
  className?: string;
  /** Optional decorative role override. Defaults to aria-hidden. */
  title?: string;
}

/**
 * Mizaan brand mark — three gradient-green crescents stacked into an
 * abstract "scale" (Arabic: ميزان). Sized via `className` like any
 * other element; the SVG fills its container.
 *
 * IDs inside the gradient defs are namespaced so multiple instances on
 * the same page don't collide. (Browsers de-duplicate matching defs but
 * we keep it tidy.)
 */
export function MizaanIcon({ className, title }: MizaanIconProps) {
  return (
    <svg
      viewBox="0 0 840 973"
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
        d="M740.77 406.976C795.088 609.693 673.706 818.351 469.655 873.026C265.604 927.701 56.155 807.69 1.83716 604.973L740.77 406.976Z"
        fill="url(#mizaan-icon-grad-1)"
        stroke="#5BE791"
        strokeWidth="3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M579.787 328.145C546.196 453.509 417.337 527.906 291.972 494.315C166.608 460.724 92.2107 331.865 125.802 206.5L579.787 328.145Z"
        fill="url(#mizaan-icon-grad-2)"
        stroke="#5BE791"
        strokeWidth="3"
      />
      <circle
        cx="483.479"
        cy="149"
        r="147.5"
        fill="url(#mizaan-icon-grad-3)"
        stroke="#5BE791"
        strokeWidth="3"
      />
      <defs>
        <linearGradient
          id="mizaan-icon-grad-1"
          x1="371.304"
          y1="505.974"
          x2="469.655"
          y2="873.026"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5BE791" />
          <stop offset="0.75" stopColor="#171717" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="mizaan-icon-grad-2"
          x1="352.795"
          y1="267.322"
          x2="291.972"
          y2="494.315"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5BE791" />
          <stop offset="0.75" stopColor="#171717" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="mizaan-icon-grad-3"
          x1="483.479"
          y1="1.5"
          x2="483.479"
          y2="296.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5BE791" />
          <stop offset="0.75" stopColor="#171717" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
