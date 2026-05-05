"use client";

import { useState } from "react";

interface ShareButtonProps {
  label: string;
  copiedLabel: string;
  /** Plain-text payload that will be copied (no PII). */
  shareText: string;
}

/** Decorative share button — copies aggregate (no PII) summary to clipboard. */
export function ShareButton({ label, copiedLabel, shareText }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // best-effort; design-only for now
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-1.25 text-xs leading-4 text-[#EFEFE4A6] transition-colors hover:border-[#14F1952E] hover:bg-[#14F19514] hover:text-[#14F195]"
      aria-label={copied ? copiedLabel : label}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
        <path
          d="M2 6.5h9M6.5 2v9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
