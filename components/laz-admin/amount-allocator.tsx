"use client";

/**
 * <AmountAllocator />
 *
 * Bigint-backed Rupiah amount input. Renders the value formatted with
 * thousands separators while persisting the raw bigint upstream. Used in the
 * "tambah mustahik" details panel of the distribution form.
 */
import { useId } from "react";
import { formatRupiah } from "@/lib/utils";
import type { SupportedLocale } from "@/lib/constants";

interface AmountAllocatorProps {
  value: bigint;
  onChange: (next: bigint) => void;
  remaining: bigint;
  locale: SupportedLocale;
  label?: string;
}

const COPY = {
  remaining: { id: "sisa belum dialokasikan", en: "remaining unallocated" },
  fillRemaining: { id: "isi sisa", en: "fill remaining" },
} as const;

export function AmountAllocator({
  value,
  onChange,
  remaining,
  locale,
  label,
}: AmountAllocatorProps) {
  const inputId = useId();

  const handleInput = (raw: string) => {
    // Strip every non-digit; keep "" as 0n.
    const digits = raw.replace(/\D+/g, "");
    if (digits.length === 0) {
      onChange(0n);
      return;
    }
    onChange(BigInt(digits));
  };

  const display = value === 0n ? "" : formatRupiah(value).replace("Rp ", "");
  const overflow = value > remaining + value; // never true; we compare upstream

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]"
        >
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-center gap-2.5 rounded-[10px] border bg-[#181818] px-3.5 py-2.75 transition-colors ${
          overflow
            ? "border-[#EF4444]/50"
            : "border-[#FFFFFF12] focus-within:border-[#14F1952E]"
        }`}
      >
        <span className="font-mono text-[12px] leading-4 font-medium text-[#EFEFE48C]">
          Rp
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="0"
          className="grow basis-0 bg-transparent text-right font-mono text-[14px] leading-5 font-medium text-[#EFEFE4] outline-none placeholder:text-[#EFEFE452]"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
          {COPY.remaining[locale]} · {formatRupiah(remaining)}
        </span>
        {remaining > 0n ? (
          <button
            type="button"
            onClick={() => onChange(remaining + value)}
            className="font-mono text-[10px] leading-3 text-[#14F195] transition-opacity hover:opacity-80"
          >
            {COPY.fillRemaining[locale]} ↗
          </button>
        ) : null}
      </div>
    </div>
  );
}
