"use client";

import { Wordmark } from "@/components/wordmark";

interface MobileShellProps {
  /** Status bar clock label (e.g. "10:32"). */
  time?: string;
  /** Connection status copy shown next to the secure indicator. */
  secureLabel: string;
  children: React.ReactNode;
}

/**
 * Mobile chrome wrapper for the mustahik /confirm flow.
 *
 * Renders a faux iOS-style status bar, the Mizaan wordmark, and clamps the
 * content to a phone-shaped column (max 440px) on wider viewports. Outside
 * the column we layer a soft dotted pattern + a green radial glow so the
 * surrounding area doesn't feel empty on a desktop browser.
 */
export function MobileShell({
  time = "10:32",
  secureLabel,
  children,
}: MobileShellProps) {
  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden bg-[#181818] text-text">
      {/* soft pattern + glow outside the phone column */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(rgba(239,239,228,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(20,241,149,0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-[#181818] sm:my-8 sm:min-h-[844px] sm:rounded-[40px] sm:border sm:border-[#FFFFFF12] sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]">
        {/* status bar */}
        <div className="flex h-11 shrink-0 items-center justify-between px-5.5 pt-3 pb-2">
          <span className="font-['Plus_Jakarta_Sans',system-ui,sans-serif] text-[15px] font-semibold leading-[18px] text-text">
            {time}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-[#14F1952E] bg-[#14F1951A] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-[#14F195]"
              aria-label={secureLabel}
            >
              <span
                aria-hidden
                className="size-1 rounded-full bg-[#14F195]"
                style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
              />
              {secureLabel}
            </span>
            <svg
              width="18"
              height="11"
              viewBox="0 0 18 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="shrink-0"
            >
              <rect
                x="1"
                y="1"
                width="14"
                height="9"
                rx="2"
                stroke="#EFEFE4"
                strokeOpacity="0.8"
              />
              <rect x="3" y="3" width="10" height="5" rx="1" fill="#EFEFE4" />
              <rect
                x="16"
                y="4"
                width="1.5"
                height="3"
                rx="0.5"
                fill="#EFEFE4"
                fillOpacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* wordmark row */}
        <div className="flex shrink-0 items-center gap-2.5 px-5.5 pt-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[#14F195] font-['Plus_Jakarta_Sans',system-ui,sans-serif] text-[15px] font-bold leading-none text-[#0A0A0A]"
            style={{ boxShadow: "0 4px 12px rgba(20,241,149,0.20)" }}
          >
            M
          </span>
          <Wordmark
            showDot={false}
            className="font-['Plus_Jakarta_Sans',system-ui,sans-serif] !font-medium text-[15px] tracking-tight"
          />
        </div>

        {children}
      </div>
    </div>
  );
}
