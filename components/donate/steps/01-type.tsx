"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DONATION_TYPES,
  DONATION_TYPE_LABELS,
  type SupportedLocale,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DonationType } from "@/lib/types";

interface Step1Props {
  value: DonationType | null;
  onChange: (next: DonationType) => void;
  onNext: () => void;
  locale: SupportedLocale;
}

export function Step1Type({ value, onChange, onNext, locale }: Step1Props) {
  const t = useTranslations("donate");

  return (
    <div className="flex flex-col gap-8">
      <div
        role="radiogroup"
        aria-label={t("step1.title")}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {DONATION_TYPES.map((type) => {
          const labels = DONATION_TYPE_LABELS[type];
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              className={cn(
                "lift relative flex flex-col items-start gap-2 rounded-[16px] border p-4 text-left transition-colors sm:p-5",
                selected
                  ? "border-[var(--color-border-accent)] bg-[rgba(20,241,149,0.04)]"
                  : "card-neutral",
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <span className="text-[16px] font-semibold leading-tight tracking-tight text-text lowercase sm:text-[18px]">
                  {labels[locale].toLowerCase()}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-white/15",
                  )}
                >
                  {selected ? (
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M2 6.5l2.5 2.5L10 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {labels.description[locale]}
              </p>
              <span
                aria-hidden
                className="mt-2 font-mono text-[10px] tracking-[0.08em] text-text-muted lowercase"
              >
                {type.toLowerCase().replace("_", " ")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="lowercase"
          disabled={!value}
          onClick={() => value && onNext()}
        >
          {t("next")} →
        </Button>
      </div>
    </div>
  );
}
