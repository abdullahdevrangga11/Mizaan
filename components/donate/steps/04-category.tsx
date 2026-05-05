"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  DONOR_CATEGORY_PREFERENCES,
  type SupportedLocale,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface Step4Props {
  value: Category[];
  onToggle: (category: Category) => void;
  onNext: () => void;
  locale: SupportedLocale;
}

export function Step4Category({
  value,
  onToggle,
  onNext,
  locale,
}: Step4Props) {
  const t = useTranslations("donate");
  const tStep = useTranslations("donate.step4");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {DONOR_CATEGORY_PREFERENCES.map((cat) => {
          const active = value.includes(cat);
          const label = CATEGORY_LABELS[cat][locale];
          return (
            <button
              key={cat}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(cat)}
              className={cn(
                "h-11 rounded-full border px-5 text-[13px] font-medium tracking-tight transition-colors lowercase",
                active
                  ? "border-[var(--color-border-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-text",
              )}
            >
              {label.toLowerCase()}
            </button>
          );
        })}
      </div>

      <p className="text-[13px] leading-relaxed text-text-muted">
        {tStep("skipNote")}
      </p>

      <div className="flex justify-end gap-3">
        <Button
          size="lg"
          variant="ghost"
          className="lowercase"
          onClick={onNext}
        >
          {t("skip")}
        </Button>
        <Button size="lg" className="lowercase" onClick={onNext}>
          {t("next")} →
        </Button>
      </div>
    </div>
  );
}
