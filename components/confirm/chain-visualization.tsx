"use client";

import { cn } from "@/lib/utils";

export type ChainStepStatus = "done" | "pending" | "active";

export interface ChainStep {
  /** Display step number, zero-padded by the caller if desired. */
  n: number;
  /** Mono uppercase eyebrow ("DONATION COMMITMENT"). */
  label: string;
  /** Plain-language detail line. */
  detail: string;
  /** Optional shortened signature/PDA, displayed in mono. */
  sig?: string;
  status: ChainStepStatus;
}

interface ChainVisualizationProps {
  /** Eyebrow label above the chain. */
  eyebrow: string;
  steps: ChainStep[];
}

/**
 * Vertical, mobile-friendly variant of the 3-attestation chain shown in
 * `HeroProductImage`. Larger touch-friendly nodes, vertical connectors, and
 * a `pending` state that visually deflates until the mustahik confirms.
 */
export function ChainVisualization({
  eyebrow,
  steps,
}: ChainVisualizationProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase leading-3 tracking-[0.05em] text-[#EFEFE46B]">
        {eyebrow}
      </span>

      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isDone = step.status === "done";
          const isActive = step.status === "active";
          const isPending = step.status === "pending";

          return (
            <li key={step.n} className="flex gap-3">
              {/* node + connector column */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "relative flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold leading-none",
                    isDone &&
                      "bg-[#14F195] text-[#0A0A0A] [box-shadow:0_0_12px_rgba(20,241,149,0.45)]",
                    isActive &&
                      "border border-[#14F1952E] bg-[#14F1951A] text-[#14F195] [box-shadow:0_0_0_3px_rgba(20,241,149,0.10)]",
                    isPending &&
                      "border border-dashed border-[#FFFFFF1F] bg-transparent text-[#EFEFE452]",
                  )}
                  aria-hidden
                >
                  {isDone ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 6.2l2.2 2.2L9 4"
                        stroke="#0A0A0A"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    step.n
                  )}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#14F195]/30"
                    />
                  )}
                </span>
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1 mb-1 w-px flex-1 min-h-6",
                      isDone ? "bg-[#14F1954D]" : "bg-[#FFFFFF14]",
                    )}
                  />
                )}
              </div>

              {/* content */}
              <div
                className={cn(
                  "flex-1 pb-5",
                  isLast && "pb-0",
                  isPending && "opacity-70",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase leading-3 tracking-[0.05em]",
                      isDone && "text-[#14F1958C]",
                      isActive && "text-[#14F195]",
                      isPending && "text-[#EFEFE452]",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.sig && (
                    <span className="font-mono text-[10px] leading-3 text-[#14F1958C]">
                      {step.sig} ↗
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "mt-1 text-[13px] leading-[18px]",
                    isPending ? "text-[#EFEFE48C]" : "text-[#EFEFE4D9]",
                  )}
                >
                  {step.detail}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
