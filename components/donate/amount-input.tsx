"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  label?: string;
  hint?: string;
  value: bigint;
  onChange: (next: bigint) => void;
  placeholder?: string;
  /** Show "Rp" prefix glyph inside the input. */
  prefix?: boolean;
  /** Visually large variant for hero step. */
  size?: "md" | "lg";
  ariaLabel?: string;
  disabled?: boolean;
}

const formatGroups = (raw: string): string => {
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export function AmountInput({
  label,
  hint,
  value,
  onChange,
  placeholder = "0",
  prefix = true,
  size = "lg",
  ariaLabel,
  disabled = false,
}: AmountInputProps) {
  const id = useId();

  const display = formatGroups(value === 0n ? "" : value.toString());

  const handleChange = (raw: string) => {
    const digitsOnly = raw.replace(/[^\d]/g, "");
    if (digitsOnly === "") {
      onChange(0n);
      return;
    }
    onChange(BigInt(digitsOnly));
  };

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={id}
          className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "card-neutral group flex items-baseline gap-2 px-4 transition-colors focus-within:border-[var(--color-border-accent)] sm:gap-3 sm:px-5",
          size === "lg" ? "h-[72px] sm:h-[88px]" : "h-[56px] sm:h-[64px]",
          disabled && "opacity-50",
        )}
      >
        {prefix ? (
          <span
            aria-hidden
            className={cn(
              "font-mono text-text-muted",
              size === "lg" ? "text-[16px] sm:text-[20px]" : "text-[14px] sm:text-[15px]",
            )}
          >
            Rp
          </span>
        ) : null}

        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={ariaLabel ?? label}
          disabled={disabled}
          value={display}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent font-medium tracking-tight text-text outline-none placeholder:text-text-faint",
            size === "lg" ? "text-[28px] sm:text-[40px] md:text-[48px]" : "text-[18px] sm:text-[20px]",
          )}
        />
      </div>

      {hint ? (
        <p className="text-[12px] leading-relaxed text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
