"use client";

import { useState } from "react";
import { shortenAddress } from "@/lib/utils";

interface IdentityPanelCopy {
  title: string;
  walletLabel: string;
  identityPdaLabel: string;
  identityPdaPlaceholder: string;
  copy: string;
  copied: string;
  /** Footnote, e.g. "data live dari solana — tidak bisa dipalsukan." */
  footnote: string;
}

interface IdentityPanelProps {
  walletAddress: string;
  identityPda: string | null;
  copy: IdentityPanelCopy;
}

export function IdentityPanel({
  walletAddress,
  identityPda,
  copy,
}: IdentityPanelProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#FFFFFF12] bg-[#1A1A1A]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(20,241,149,0.04) 0%, transparent 50%)",
        boxShadow: "inset 0 1px 0 rgba(20,241,149,0.18)",
      }}
    >
      <div className="flex items-center justify-between border-b border-[#FFFFFF0F] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-[#14F195]"
            style={{ boxShadow: "0 0 8px rgba(20,241,149,0.7)" }}
          />
          <span className="font-mono text-[11px] leading-3 font-medium uppercase tracking-[0.06em] text-[#14F195]">
            {copy.title}
          </span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-[#FFFFFF0F]">
        <IdentityRow
          label={copy.walletLabel}
          value={walletAddress}
          display={shortenAddress(walletAddress, 8, 8)}
          copyLabel={copy.copy}
          copiedLabel={copy.copied}
        />
        <IdentityRow
          label={copy.identityPdaLabel}
          value={identityPda ?? ""}
          display={
            identityPda
              ? shortenAddress(identityPda, 8, 8)
              : copy.identityPdaPlaceholder
          }
          copyLabel={copy.copy}
          copiedLabel={copy.copied}
          disabled={!identityPda}
        />
      </div>

      <div className="border-t border-[#FFFFFF0F] bg-[#14F19506] px-4 py-3 sm:px-6">
        <p className="m-0 font-mono text-[10px] leading-4 tracking-[0.04em] text-[#EFEFE466]">
          {copy.footnote}
        </p>
      </div>
    </div>
  );
}

function IdentityRow({
  label,
  value,
  display,
  copyLabel,
  copiedLabel,
  disabled = false,
}: {
  label: string;
  value: string;
  display: string;
  copyLabel: string;
  copiedLabel: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.05em] text-[#EFEFE466]">
          {label}
        </span>
        <span className="truncate font-mono text-[12px] leading-4 text-[#EFEFE4D9] sm:text-[13px]">
          {display}
        </span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-[8px] border border-[#FFFFFF12] bg-[#FFFFFF06] px-2.5 py-1.5 font-mono text-[10px] leading-3 uppercase tracking-[0.05em] text-[#EFEFE48C] transition-colors hover:border-[#14F1952E] hover:text-[#14F195] disabled:opacity-40 disabled:hover:border-[#FFFFFF12] disabled:hover:text-[#EFEFE48C]"
      >
        {copied ? (
          <>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path
                d="M2 5l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {copiedLabel}
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <rect
                x="2"
                y="2"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M3.5 1h5a1 1 0 011 1v5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {copyLabel}
          </>
        )}
      </button>
    </div>
  );
}
